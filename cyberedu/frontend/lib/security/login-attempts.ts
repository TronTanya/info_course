/**
 * Учёт неудачных попыток входа (brute force / credential stuffing).
 * Production: Redis (shared across replicas). Development: in-memory fallback.
 */

import { enforceRateLimit, RATE_LIMIT_POLICIES } from "@/lib/security/rate-limit";
import {
  getSharedRedisClient,
  isAutomatedTestRuntime,
  isDevMemoryFallbackAllowed,
} from "@/lib/security/rate-limit-service";

export const LOGIN_LOCKOUT_MAX_FAILURES = 8;
export const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;
export const LOGIN_ATTEMPT_WINDOW_MS = 30 * 60 * 1000;

type AttemptBucket = { failures: number; lockedUntil: number };

const memoryByKey = new Map<string, AttemptBucket>();
let lockoutFallbackWarned = false;

function bucketKey(email: string, ip: string): string {
  return `${email.toLowerCase()}|${ip}`;
}

function redisFailKey(k: string): string {
  return `login:fail:${k}`;
}

function redisLockKey(k: string): string {
  return `login:lock:${k}`;
}

function warnLockoutMemoryFallback(reason: string): void {
  if (lockoutFallbackWarned) return;
  lockoutFallbackWarned = true;
  console.warn(
    `[login-lockout] ${reason} — in-process lockout (dev/degraded; not shared across replicas)`,
  );
}

function memoryGetBucket(k: string): AttemptBucket {
  const now = Date.now();
  let b = memoryByKey.get(k);
  if (!b) {
    b = { failures: 0, lockedUntil: 0 };
    memoryByKey.set(k, b);
  } else if (b.lockedUntil > 0 && now > b.lockedUntil + LOGIN_ATTEMPT_WINDOW_MS) {
    b = { failures: 0, lockedUntil: 0 };
    memoryByKey.set(k, b);
  }
  return b;
}

function memoryIsLocked(email: string, ip: string): boolean {
  const b = memoryByKey.get(bucketKey(email, ip));
  if (!b) return false;
  const now = Date.now();
  if (now < b.lockedUntil) return true;
  if (b.lockedUntil > 0 && now > b.lockedUntil + LOGIN_ATTEMPT_WINDOW_MS) {
    memoryByKey.delete(bucketKey(email, ip));
  }
  return false;
}

function memoryRecordFailed(
  email: string,
  ip: string,
): { locked: boolean; failures: number } {
  const k = bucketKey(email, ip);
  const now = Date.now();
  const b = memoryGetBucket(k);
  b.failures += 1;
  if (b.failures >= LOGIN_LOCKOUT_MAX_FAILURES) {
    b.lockedUntil = now + LOGIN_LOCKOUT_MS;
  }
  memoryByKey.set(k, b);
  return { locked: b.failures >= LOGIN_LOCKOUT_MAX_FAILURES, failures: b.failures };
}

function memoryClear(email: string, ip: string): void {
  memoryByKey.delete(bucketKey(email, ip));
}

async function redisIsLocked(email: string, ip: string): Promise<boolean | null> {
  const client = await getSharedRedisClient();
  if (!client) return null;
  try {
    const k = bucketKey(email, ip);
    const locked = await client.get(redisLockKey(k));
    return locked === "1";
  } catch {
    return null;
  }
}

async function redisRecordFailed(
  email: string,
  ip: string,
): Promise<{ locked: boolean; failures: number } | null> {
  const client = await getSharedRedisClient();
  if (!client) return null;
  try {
    const k = bucketKey(email, ip);
    const failKey = redisFailKey(k);
    const count = await client.incr(failKey);
    if (count === 1) {
      await client.pExpire(failKey, LOGIN_ATTEMPT_WINDOW_MS);
    }
    if (count >= LOGIN_LOCKOUT_MAX_FAILURES) {
      await client.set(redisLockKey(k), "1", { PX: LOGIN_LOCKOUT_MS });
    }
    return {
      locked: count >= LOGIN_LOCKOUT_MAX_FAILURES,
      failures: count,
    };
  } catch {
    return null;
  }
}

async function redisClear(email: string, ip: string): Promise<boolean> {
  const client = await getSharedRedisClient();
  if (!client) return false;
  try {
    const k = bucketKey(email, ip);
    await client.del([redisFailKey(k), redisLockKey(k)]);
    return true;
  } catch {
    return false;
  }
}

function applyMemoryLockoutFallback(reason: string): boolean {
  if (isDevMemoryFallbackAllowed()) {
    warnLockoutMemoryFallback(reason);
    return true;
  }
  warnLockoutMemoryFallback(`${reason} (production degraded mode)`);
  return true;
}

export async function isLoginLocked(email: string, ip: string): Promise<boolean> {
  if (isAutomatedTestRuntime()) {
    return memoryIsLocked(email, ip);
  }

  const redisLocked = await redisIsLocked(email, ip);
  if (redisLocked !== null) return redisLocked;

  if (applyMemoryLockoutFallback("REDIS_URL unset or Redis unreachable")) {
    return memoryIsLocked(email, ip);
  }
  return false;
}

export async function recordFailedLogin(
  email: string,
  ip: string,
): Promise<{ locked: boolean; failures: number }> {
  if (isAutomatedTestRuntime()) {
    return memoryRecordFailed(email, ip);
  }

  const redisResult = await redisRecordFailed(email, ip);
  if (redisResult) return redisResult;

  if (applyMemoryLockoutFallback("REDIS_URL unset or Redis unreachable")) {
    return memoryRecordFailed(email, ip);
  }
  return { locked: false, failures: 0 };
}

export async function clearLoginAttempts(email: string, ip: string): Promise<void> {
  const cleared = await redisClear(email, ip);
  memoryClear(email, ip);
  if (!cleared && !isDevMemoryFallbackAllowed()) {
    /* memory cleared above; Redis may be temporarily unavailable */
  }
}

/** Сброс in-memory lockout (тесты). */
export function resetLoginLockoutStoreForTests(): void {
  memoryByKey.clear();
  lockoutFallbackWarned = false;
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
