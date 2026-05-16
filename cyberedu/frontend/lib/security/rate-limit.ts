/**
 * Публичный API rate limiting — делегирует в `rate-limit-service` (Redis + dev fallback).
 */

import {
  consumeRateLimitKey,
  consumeRateLimitSyncDevOnly,
  enforceRateLimit,
  getMemoryRateLimitResetAt,
  rateLimitSubject,
  type RateLimitResult,
} from "@/lib/security/rate-limit-service";

export type { RateLimitResult };
export {
  enforceRateLimit,
  rateLimitSubject,
  RATE_LIMIT_POLICIES,
} from "@/lib/security/rate-limit-service";

/** @deprecated Используйте `enforceRateLimit`. Sync path — только dev in-memory. */
export function consumeRateLimit(key: string, max: number, windowMs: number): boolean {
  return consumeRateLimitSyncDevOnly(key, max, windowMs);
}

export async function consumeRateLimitAsync(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const normalized = key.startsWith("rl:") ? key : `rl:${key}`;
  return consumeRateLimitKey(normalized, max, windowMs);
}

export function getRateLimitResetAt(key: string): number | null {
  const normalized = key.startsWith("rl:") ? key : `rl:${key}`;
  return getMemoryRateLimitResetAt(normalized);
}

/** Лимит по userId (если авторизован) или по доверенному IP. */
export async function consumeScopedRateLimit(opts: {
  scope: string;
  userId?: string | null;
  clientIp: string;
  max: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  return enforceRateLimit({
    scope: opts.scope,
    userId: opts.userId,
    clientIp: opts.clientIp,
    max: opts.max,
    windowMs: opts.windowMs,
  });
}

/** @deprecated Используйте `consumeScopedRateLimit`. */
export async function consumeCompositeRateLimit(opts: {
  ipKey: string;
  userKey?: string;
  ipMax: number;
  userMax?: number;
  windowMs: number;
  userId?: string | null;
  clientIp?: string;
}): Promise<RateLimitResult> {
  const scopeFromUser = opts.userKey?.match(/^(?:rl:)?([^:]+)/)?.[1];
  const scopeFromIp = opts.ipKey?.match(/^(?:rl:)?([^:]+)/)?.[1];
  const scope = scopeFromUser ?? scopeFromIp ?? "legacy";

  if (opts.userId && opts.userMax != null) {
    return enforceRateLimit({
      scope,
      userId: opts.userId,
      clientIp: opts.clientIp ?? "unknown",
      max: opts.userMax,
      windowMs: opts.windowMs,
    });
  }

  return enforceRateLimit({
    scope,
    clientIp: opts.clientIp ?? "unknown",
    max: opts.ipMax,
    windowMs: opts.windowMs,
  });
}
