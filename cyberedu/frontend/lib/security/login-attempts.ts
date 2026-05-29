/**
 * Учёт неудачных попыток входа (brute force / credential stuffing).
 */

import { enforceRateLimit, RATE_LIMIT_POLICIES, isMemoryFallbackAllowed } from "@/lib/security/rate-limit";
import { getSharedRedisClient } from "@/lib/security/redis-client";

type AttemptBucket = { failures: number; lockedUntil: number };

const byKey = new Map<string, AttemptBucket>();

const MAX_FAILURES = 8;
const LOCKOUT_MS = 15 * 60 * 1000;
const WINDOW_MS = 30 * 60 * 1000;
const LOCK_KEY_PREFIX = "auth:login:lock";
const FAIL_KEY_PREFIX = "auth:login:fail";
let redisUnavailableWarned = false;

type RedisClient = {
  incr: (key: string) => Promise<number>;
  pExpire: (key: string, ms: number) => Promise<number>;
  pTTL: (key: string) => Promise<number>;
};

async function getRedis(): Promise<RedisClient | null> {
  const client = await getSharedRedisClient();
  return client as RedisClient | null;
}

function isProductionRuntime(): boolean {
  const environment = (process.env.ENVIRONMENT ?? "").trim().toLowerCase();
  return environment === "production" || environment === "prod";
}

function loginLockoutUsesMemoryFallback(): boolean {
  return !isProductionRuntime() || isMemoryFallbackAllowed();
}

function warnRedisUnavailable(): void {
  if (redisUnavailableWarned) return;
  redisUnavailableWarned = true;
  const msg = isProductionRuntime() && !isMemoryFallbackAllowed()
    ? "[auth] Redis unavailable for login lockout; denying lockout checks (fail-closed)."
    : "[auth] Redis unavailable for login lockout; fallback to in-memory lockout (not shared across replicas).";
  if (isProductionRuntime() && !isMemoryFallbackAllowed()) {
    console.error(msg);
    return;
  }
  console.warn(msg);
}

/** Production без Redis (не Vercel): не ослаблять brute-force через in-memory fallback. */
function loginLockoutFailClosed(): { locked: boolean; failures: number } {
  return { locked: true, failures: MAX_FAILURES };
}

function key(email: string, ip: string): string {
  return `${email.toLowerCase()}|${ip}`;
}

function failKey(email: string, ip: string): string {
  return `${FAIL_KEY_PREFIX}:${key(email, ip)}`;
}

function lockKey(email: string, ip: string): string {
  return `${LOCK_KEY_PREFIX}:${key(email, ip)}`;
}

function isLoginLockedMemory(email: string, ip: string): boolean {
  const b = byKey.get(key(email, ip));
  if (!b) return false;
  if (Date.now() < b.lockedUntil) return true;
  if (Date.now() > b.lockedUntil + WINDOW_MS) {
    byKey.delete(key(email, ip));
    return false;
  }
  return false;
}

function recordFailedLoginMemory(email: string, ip: string): { locked: boolean; failures: number } {
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

function clearLoginAttemptsMemory(email: string, ip: string): void {
  byKey.delete(key(email, ip));
}

/** Полный сброс in-memory lockout (только dev/e2e, тот же процесс, что и Next.js). */
export function resetLoginLockoutMemoryStore(): void {
  byKey.clear();
}

export async function isLoginLocked(email: string, ip: string): Promise<boolean> {
  const redis = await getRedis();
  if (!redis) {
    warnRedisUnavailable();
    if (!loginLockoutUsesMemoryFallback()) return true;
    return isLoginLockedMemory(email, ip);
  }
  try {
    const ttl = await redis.pTTL(lockKey(email, ip));
    return ttl > 0;
  } catch {
    warnRedisUnavailable();
    if (!loginLockoutUsesMemoryFallback()) return true;
    return isLoginLockedMemory(email, ip);
  }
}

export async function recordFailedLogin(
  email: string,
  ip: string,
): Promise<{ locked: boolean; failures: number }> {
  const redis = await getRedis();
  if (!redis) {
    warnRedisUnavailable();
    if (!loginLockoutUsesMemoryFallback()) return loginLockoutFailClosed();
    return recordFailedLoginMemory(email, ip);
  }
  try {
    const failures = await redis.incr(failKey(email, ip));
    if (failures === 1) {
      await redis.pExpire(failKey(email, ip), WINDOW_MS);
    }
    if (failures >= MAX_FAILURES) {
      const lockCount = await redis.incr(lockKey(email, ip));
      if (lockCount === 1) {
        await redis.pExpire(lockKey(email, ip), LOCKOUT_MS);
      }
      return { locked: true, failures };
    }
    return { locked: false, failures };
  } catch {
    warnRedisUnavailable();
    if (!loginLockoutUsesMemoryFallback()) return loginLockoutFailClosed();
    return recordFailedLoginMemory(email, ip);
  }
}

export async function clearLoginAttempts(email: string, ip: string): Promise<void> {
  const redis = await getRedis();
  if (!redis) {
    clearLoginAttemptsMemory(email, ip);
    return;
  }
  try {
    await Promise.all([redis.pExpire(failKey(email, ip), 1), redis.pExpire(lockKey(email, ip), 1)]);
  } catch {
    clearLoginAttemptsMemory(email, ip);
  }
}

/** Лимит попыток входа по доверенному IP (до проверки пароля). */
export async function checkLoginRateLimit(clientIp: string): Promise<{ ok: true } | { ok: false }> {
  const p = RATE_LIMIT_POLICIES.login;
  const r = await enforceRateLimit({
    scope: p.scope,
    clientIp,
    max: p.max,
    windowMs: p.windowMs,
  });
  return r.allowed ? { ok: true } : { ok: false };
}

/** Лимит POST /api/auth/callback/credentials (по IP). */
export async function checkCredentialsCallbackRateLimit(
  clientIp: string,
): Promise<{ ok: true } | { ok: false }> {
  const p = RATE_LIMIT_POLICIES.loginCredentials;
  const r = await enforceRateLimit({
    scope: p.scope,
    clientIp,
    max: p.max,
    windowMs: p.windowMs,
  });
  return r.allowed ? { ok: true } : { ok: false };
}
