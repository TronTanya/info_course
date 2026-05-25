import type {
  EvidenceItem,
  EvidenceLogEntry,
  EvidenceUrlDisplay,
} from "@/types/practice-view-model";

const SAFE_PRACTICE_DOWNLOAD_PREFIX = "/api/practice/download";

/** Разбор URL для отображения без навигации по ссылке. */
export function parseUrlForDisplay(raw: string, visibleText?: string): EvidenceUrlDisplay {
  const fullUrl = raw.trim();
  const fallback: EvidenceUrlDisplay = {
    fullUrl,
    protocol: "—",
    domain: "—",
    path: "—",
    visibleText: visibleText?.trim() || undefined,
  };
  try {
    const u = new URL(fullUrl.includes("://") ? fullUrl : `https://${fullUrl}`);
    return {
      fullUrl,
      protocol: u.protocol.replace(/:$/, "") || "—",
      domain: u.hostname || "—",
      path: `${u.pathname}${u.search}${u.hash}` || "/",
      visibleText: visibleText?.trim() || undefined,
    };
  } catch {
    return fallback;
  }
}

/** Извлечь http(s) ссылки из текста письма (не кликабельные в UI). */
export function extractHttpLinksFromText(text: string): string[] {
  const found = text.match(/https?:\/\/[^\s<>"']+/gi) ?? [];
  return [...new Set(found.map((s) => s.replace(/[.,;]+$/, "")))];
}

const LOG_LINE_RE =
  /^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s+(.+)$/;

const SEVERITY_RE = /\b(INFO|WARN|WARNING|ERROR|ERR|CRITICAL|DEBUG|ALERT)\b/i;

/** Эвристический разбор строк журнала для таблицы. */
export function parseLogContent(content: string): EvidenceLogEntry[] {
  const lines = content.split(/\n/).map((l) => l.trim()).filter(Boolean);
  return lines.map((raw) => {
    const m = raw.match(LOG_LINE_RE);
    if (m) {
      const rest = m[2] ?? raw;
      const sev = rest.match(SEVERITY_RE);
      const event = sev ? rest.replace(sev[0], "").trim() : rest;
      return {
        timestamp: m[1],
        source: rest.includes("user=") ? "auth" : undefined,
        event: event || rest,
        severity: sev ? sev[1].toUpperCase() : undefined,
        raw,
      };
    }
    const sev = raw.match(SEVERITY_RE);
    return {
      severity: sev ? sev[1].toUpperCase() : undefined,
      event: raw,
      raw,
    };
  });
}

/** Только безопасный download route практики (без storage path). */
export function isSafePracticeFileUrl(url: string | undefined): boolean {
  if (!url?.trim()) return false;
  const t = url.trim();
  if (t.includes("..") || t.startsWith("file:")) return false;
  if (!t.startsWith(SAFE_PRACTICE_DOWNLOAD_PREFIX)) return false;
  try {
    const parsed = new URL(t, "http://localhost");
    const id = parsed.searchParams.get("id")?.trim() ?? "";
    return (
      parsed.pathname === "/api/practice/download" &&
      id.length > 0 &&
      !id.includes("..") &&
      !id.includes("/") &&
      !id.includes("\\")
    );
  } catch {
    return false;
  }
}

export function safePracticeDownloadHref(url: string | undefined): string | null {
  return isSafePracticeFileUrl(url) ? url!.trim() : null;
}

export function evidenceItemLabel(type: EvidenceItem["type"]): string {
  const labels: Record<EvidenceItem["type"], string> = {
    email: "Письмо",
    url: "URL",
    log: "Журнал",
    text: "Текст",
    file: "Файл",
    image: "Изображение",
    table: "Таблица",
    code: "Код / хэш",
  };
  return labels[type] ?? "Артефакт";
}
