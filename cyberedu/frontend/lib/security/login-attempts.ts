/**
 * Учёт неудачных попыток входа (brute force / credential stuffing).
 */

import { consumeRateLimitAsync } from "@/lib/security/rate-limit";

type AttemptBucket = { failures: number; lockedUntil: number };

const byKey = new Map<string, AttemptBucket>();

const MAX_FAILURES = 8;
const LOCKOUT_MS = 15 * 60 * 1000;
const WINDOW_MS = 30 * 60 * 1000;

function key(email: string, ip: string): string {
  return `${email.toLowerCase()}|${ip}`;
}

export function isLoginLocked(email: string, ip: string): boolean {
  const b = byKey.get(key(email, ip));
  if (!b) return false;
  if (Date.now() < b.lockedUntil) return true;
  if (Date.now() > b.lockedUntil + WINDOW_MS) {
    byKey.delete(key(email, ip));
    return false;
  }
  return false;
}

export function recordFailedLogin(email: string, ip: string): { locked: boolean; failures: number } {
  const k = key(email, ip);
  const now = Date.now();
  let b = byKey.get(k);
  if (!b) {
    b = { failures: 0, lockedUntil: 0 };
  } else if (b.lockedUntil > 0 && now > b.lockedUntil + WINDOW_MS) {
    b = { failures: 0, lockedUntil: 0 };
  }
  b.failures += 1;
  if (b.failures >= MAX_FAILURES) {
    b.lockedUntil = now + LOCKOUT_MS;
  }
  byKey.set(k, b);
  return { locked: b.failures >= MAX_FAILURES, failures: b.failures };
}

export function clearLoginAttempts(email: string, ip: string): void {
  byKey.delete(key(email, ip));
}

/** Дополнительный лимит на уровне IP для callback credentials. */
export async function checkLoginRateLimit(ip: string): Promise<{ ok: true } | { ok: false }> {
  const r = await consumeRateLimitAsync(`auth:login:ip:${ip}`, 25, 15 * 60 * 1000);
  return r.allowed ? { ok: true } : { ok: false };
}
