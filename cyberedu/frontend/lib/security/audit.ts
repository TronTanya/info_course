import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { SecurityAction } from "@/lib/security/audit-actions";
import { isValidClientIp } from "@/lib/security/request-ip";

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
  "verification_code",
  "refresh_token",
  "access_token",
  "message",
  "content",
  "history",
  "prompt",
  "reply",
  "usermessage",
  "openai",
  "apikey",
  "email",
  "fullname",
  "full_name",
  "firstname",
  "lastname",
];

function isRedactedKey(key: string): boolean {
  const k = key.toLowerCase();
  return REDACT_SUBSTRINGS.some((s) => k.includes(s));
}

/** Нормализованный IP для аудита (без сырых proxy-цепочек). */
export function normalizeAuditIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const trimmed = ip.trim().slice(0, 64);
  if (!trimmed || trimmed === "direct") return trimmed === "direct" ? "direct" : null;
  return isValidClientIp(trimmed) ? trimmed : "invalid";
}

function sanitizeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const safe: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (isRedactedKey(k)) continue;
    if (typeof v === "string") safe[k] = v.length > 500 ? `${v.slice(0, 500)}…` : v;
    else if (v === null || typeof v === "number" || typeof v === "boolean") safe[k] = v;
    else if (Array.isArray(v)) {
      safe[k] = v.slice(0, 20).map((item) =>
        typeof item === "string" ? (item.length > 120 ? `${item.slice(0, 120)}…` : item) : "[omitted]",
      );
    } else safe[k] = "[omitted]";
  }
  return safe;
}

export type LogSecurityEventInput = {
  /** actor / userId */
  userId?: string | null;
  action: SecurityAction | string;
  targetId?: string | null;
  severity?: AuditSeverity;
  ip?: string | null;
  path?: string | null;
  metadata?: Record<string, unknown>;
};

export type SecurityAuditInput = {
  event: string;
  severity?: AuditSeverity;
  actorId?: string | null;
  ip?: string | null;
  path?: string | null;
  meta?: Record<string, unknown>;
  targetId?: string | null;
};

/**
 * Основной helper аудита: userId, action, targetId, timestamp (createdAt), metadata.
 * Не пишет секреты, пароли, полные AI prompt/ответы.
 */
export function logSecurityEvent(input: LogSecurityEventInput): void {
  const action = input.action.slice(0, 120);
  securityAudit({
    event: action,
    actorId: input.userId ?? null,
    targetId: input.targetId ?? null,
    severity: input.severity ?? "info",
    ip: normalizeAuditIp(input.ip),
    path: input.path ?? null,
    meta: input.metadata,
  });
}

/**
 * Обязательный аудит для admin mutations (вызывать после успешной мутации).
 */
export function logAdminSecurityEvent(
  adminUserId: string,
  action: SecurityAction,
  targetId: string | null,
  metadata?: Record<string, unknown>,
  opts?: { ip?: string | null; path?: string | null; severity?: AuditSeverity },
): void {
  logSecurityEvent({
    userId: adminUserId,
    action,
    targetId,
    severity: opts?.severity ?? "info",
    ip: opts?.ip,
    path: opts?.path,
    metadata,
  });
}

export function securityAudit(input: SecurityAuditInput): void {
  const severity = input.severity ?? "info";
  const action = input.event.slice(0, 120);
  const meta = sanitizeMeta(input.meta);
  const ip = normalizeAuditIp(input.ip);
  const line = {
    channel: "security_audit",
    action,
    event: action,
    severity,
    ts: new Date().toISOString(),
    userId: input.actorId ?? null,
    actorId: input.actorId ?? null,
    targetId: input.targetId ?? null,
    ip,
    path: input.path ?? null,
    metadata: meta ?? null,
  };
  console.info(JSON.stringify(line));

  void persistAudit({ ...input, event: action }, severity, meta, ip).catch(() => {
    /* не блокируем запрос при сбое БД */
  });
}

async function persistAudit(
  input: SecurityAuditInput,
  severity: AuditSeverity,
  meta: Record<string, unknown> | undefined,
  ip: string | null,
): Promise<void> {
  if (process.env.SECURITY_AUDIT_DB === "0") return;
  await prisma.securityAuditLog.create({
    data: {
      event: input.event.slice(0, 120),
      action: input.event.slice(0, 120),
      severity,
      actorId: input.actorId ?? null,
      targetId: input.targetId?.slice(0, 128) ?? null,
      ip,
      path: input.path?.slice(0, 512) ?? null,
      meta: (meta ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

/** @deprecated используйте logSecurityEvent */
export function securityLog(event: string, meta?: Record<string, unknown>): void {
  securityAudit({ event, meta });
}
