import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type AuditSeverity = "info" | "warn" | "high";

const REDACT_SUBSTRINGS = [
  "password",
  "passwordhash",
  "secret",
  "token",
  "authorization",
  "cookie",
  "apikey",
  "api_key",
  "verificationcode",
  "refresh_token",
  "access_token",
];

function isRedactedKey(key: string): boolean {
  const k = key.toLowerCase();
  return REDACT_SUBSTRINGS.some((s) => k.includes(s));
}

function sanitizeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (isRedactedKey(k)) continue;
    if (typeof v === "string") safe[k] = v.length > 500 ? `${v.slice(0, 500)}…` : v;
    else if (v === null || typeof v === "number" || typeof v === "boolean") safe[k] = v;
    else safe[k] = "[omitted]";
  }
  return safe;
}

export type SecurityAuditInput = {
  event: string;
  severity?: AuditSeverity;
  actorId?: string | null;
  ip?: string | null;
  path?: string | null;
  meta?: Record<string, unknown>;
};

/**
 * Структурированный аудит: stdout (SIEM) + асинхронная запись в БД.
 * Не логирует пароли, токены, ключи API.
 */
export function securityAudit(input: SecurityAuditInput): void {
  const severity = input.severity ?? "info";
  const meta = sanitizeMeta(input.meta);
  const line = {
    channel: "security_audit",
    event: input.event,
    severity,
    ts: new Date().toISOString(),
    actorId: input.actorId ?? null,
    ip: input.ip ?? null,
    path: input.path ?? null,
    ...meta,
  };
  console.info(JSON.stringify(line));

  void persistAudit(input, severity, meta).catch(() => {
    /* не блокируем запрос при сбое БД */
  });
}

async function persistAudit(
  input: SecurityAuditInput,
  severity: AuditSeverity,
  meta: Record<string, unknown> | undefined,
): Promise<void> {
  if (process.env.SECURITY_AUDIT_DB === "0") return;
  await prisma.securityAuditLog.create({
    data: {
      event: input.event.slice(0, 120),
      severity,
      actorId: input.actorId ?? null,
      ip: input.ip?.slice(0, 64) ?? null,
      path: input.path?.slice(0, 512) ?? null,
      meta: (meta ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

/** @deprecated используйте securityAudit */
export function securityLog(event: string, meta?: Record<string, unknown>): void {
  securityAudit({ event, meta });
}
