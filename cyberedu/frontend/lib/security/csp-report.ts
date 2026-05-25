/**
 * Приём CSP violation reports: санитизация без URL с query, токенов и тел запросов.
 */

const MAX_FIELD = 256;
const MAX_REPORTS = 4;

export type SanitizedCspViolation = {
  violatedDirective?: string;
  effectiveDirective?: string;
  disposition?: string;
  statusCode?: number;
  documentPath?: string;
  blockedHost?: string;
  sourcePath?: string;
};

function trimField(raw: unknown, max = MAX_FIELD): string | undefined {
  if (typeof raw !== "string") return undefined;
  const t = raw.trim().slice(0, max);
  return t.length ? t : undefined;
}

/** Путь без query/hash; отбрасывает абсолютные URL с чужим origin. */
export function safeCspUriPath(raw: unknown): string | undefined {
  const s = trimField(raw, 512);
  if (!s) return undefined;
  if (s.includes("..")) return undefined;
  try {
    const u = new URL(s, "https://csp.local");
    if (u.protocol !== "https:" && u.protocol !== "http:") return undefined;
    const path = u.pathname.slice(0, MAX_FIELD);
    if (path.includes("..")) return undefined;
    return path.length ? path : "/";
  } catch {
    if (s.startsWith("/")) return s.slice(0, MAX_FIELD);
    return undefined;
  }
}

/** Только host blocked-uri (без path/query — меньше утечек). */
export function safeCspBlockedHost(raw: unknown): string | undefined {
  const s = trimField(raw, 512);
  if (!s) return undefined;
  try {
    const u = new URL(s);
    return u.hostname.slice(0, MAX_FIELD) || undefined;
  } catch {
    return undefined;
  }
}

function parseStatusCode(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isFinite(raw)) return Math.trunc(raw);
  if (typeof raw === "string" && /^\d{3}$/.test(raw.trim())) return Number(raw.trim());
  return undefined;
}

function normalizeOneReport(raw: unknown): SanitizedCspViolation | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const inner =
    r["csp-report"] && typeof r["csp-report"] === "object" && !Array.isArray(r["csp-report"])
      ? (r["csp-report"] as Record<string, unknown>)
      : r;

  const out: SanitizedCspViolation = {
    violatedDirective: trimField(inner["violated-directive"] ?? inner.violatedDirective),
    effectiveDirective: trimField(inner["effective-directive"] ?? inner.effectiveDirective),
    disposition: trimField(inner.disposition),
    statusCode: parseStatusCode(inner["status-code"] ?? inner.statusCode),
    documentPath: safeCspUriPath(inner["document-uri"] ?? inner.documentURI),
    blockedHost: safeCspBlockedHost(inner["blocked-uri"] ?? inner.blockedURI),
    sourcePath: safeCspUriPath(inner["source-file"] ?? inner.sourceFile),
  };

  if (
    !out.violatedDirective &&
    !out.effectiveDirective &&
    !out.blockedHost &&
    !out.documentPath
  ) {
    return null;
  }
  return out;
}

/** Парсит тело POST (JSON object или массив отчётов). */
export function parseSanitizedCspReports(body: unknown): SanitizedCspViolation[] {
  if (!body) return [];
  const list = Array.isArray(body) ? body.slice(0, MAX_REPORTS) : [body];
  const out: SanitizedCspViolation[] = [];
  for (const item of list) {
    const one = normalizeOneReport(item);
    if (one) out.push(one);
    if (out.length >= MAX_REPORTS) break;
  }
  return out;
}
