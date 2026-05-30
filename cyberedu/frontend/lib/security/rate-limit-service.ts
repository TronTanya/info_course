/**
 * Централизованный rate limiter: Redis (fixed window + TTL), in-memory только в dev с warning.
 */
import { logError, logWarn } from "@/lib/log/structured";
import { getSharedRedisClient, resetSharedRedisClientForTests } from "@/lib/security/redis-client";

export type RateLimitDenyReason = "exceeded" | "unavailable";

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number; reason: RateLimitDenyReason };

export const RATE_LIMIT_POLICIES = {
  login: { scope: "auth:login", max: 25, windowMs: 15 * 60 * 1000 },
  loginCredentials: { scope: "auth:credentials", max: 20, windowMs: 15 * 60 * 1000 },
  registerIp: { scope: "auth:register", max: 8, windowMs: 60 * 60 * 1000 },
  registerEmail: { scope: "auth:register:email", max: 5, windowMs: 24 * 60 * 60 * 1000 },
  aiChat: { scope: "ai:chat", max: 60, windowMs: 60 * 60 * 1000 },
  certVerify: { scope: "cert:verify", max: 40, windowMs: 15 * 60 * 1000 },
  adminExport: { scope: "admin:export", max: 10, windowMs: 60 * 60 * 1000 },
  upload: { scope: "upload", max: 20, windowMs: 60 * 60 * 1000 },
  practiceCheck: { scope: "practice:check", max: 40, windowMs: 60 * 60 * 1000 },
  practiceDownload: { scope: "practice:download", max: 80, windowMs: 60 * 60 * 1000 },
  certGenerate: { scope: "cert:generate", max: 15, windowMs: 24 * 60 * 60 * 1000 },
  aiLessonAdapt: { scope: "ai:adapt", max: 40, windowMs: 60 * 60 * 1000 },
  testSubmit: { scope: "test:submit", max: 40, windowMs: 60 * 60 * 1000 },
  practiceText: { scope: "practice:text", max: 45, windowMs: 60 * 60 * 1000 },
  practiceInteractive: { scope: "practice:interactive", max: 60, windowMs: 60 * 60 * 1000 },
  practiceStructured: { scope: "practice:structured", max: 80, windowMs: 60 * 60 * 1000 },
  adminMutation: { scope: "admin:mutation", max: 120, windowMs: 60 * 60 * 1000 },
  reviewSubmit: { scope: "review:submit", max: 3, windowMs: 60 * 60 * 1000 },
} as const;

type MemoryBucket = { count: number; resetAt: number };

const memory = new Map<string, MemoryBucket>();
const MAX_MEMORY_KEYS = 25_000;
let memoryFallbackWarned = false;
let redisFailureWarned = false;

type RedisClient = {
  eval: (script: string, options: { keys: string[]; arguments: string[] }) => Promise<unknown>;
};

function isProductionRuntime(): boolean {
  const environment = (process.env.ENVIRONMENT ?? "").trim().toLowerCase();
  return environment === "production" || environment === "prod";
}

/** In-memory limiter when Redis is absent (dev always; Vercel serverless without Redis). */
export function isMemoryFallbackAllowed(): boolean {
  if (!isProductionRuntime()) return true;
  return (process.env.VERCEL ?? "").trim() === "1";
}

function isDevMemoryFallbackAllowed(): boolean {
  return isMemoryFallbackAllowed();
}

function isAutomatedTestRuntime(): boolean {
  // Never bypass limits in production — mis-set E2E_USE_SEED_CREDENTIALS in .env would disable all RL.
  if (isProductionRuntime()) return false;
  const nodeEnv = (process.env.NODE_ENV ?? "").trim().toLowerCase();
  if (nodeEnv === "production") return false;

  const env = (process.env.ENVIRONMENT ?? "").trim().toLowerCase();
  return env === "test" || env === "e2e" || process.env.E2E_USE_SEED_CREDENTIALS === "1";
}

function warnMemoryFallback(reason: string): void {
  if (memoryFallbackWarned) return;
  memoryFallbackWarned = true;
  console.warn(
    `[rate-limit] ${reason} — in-process limiter (dev only; not shared across replicas; resets on restart)`,
  );
}

function rateLimitKeyMeta(key: string): { scope: string; subjectKind: "user" | "ip" | "unknown" } {
  if (!key.startsWith("rl:")) return { scope: "unknown", subjectKind: "unknown" };
  const rest = key.slice(3);
  const userIdx = rest.lastIndexOf(":user:");
  if (userIdx >= 0) {
    return { scope: rest.slice(0, userIdx), subjectKind: "user" };
  }
  const ipIdx = rest.lastIndexOf(":ip:");
  if (ipIdx >= 0) {
    return { scope: rest.slice(0, ipIdx), subjectKind: "ip" };
  }
  return { scope: "unknown", subjectKind: "unknown" };
}

function logRedisFailureOnce(reason: string, key: string): void {
  if (redisFailureWarned) return;
  redisFailureWarned = true;
  const meta = rateLimitKeyMeta(key);
  const fields = {
    component: "rate_limit_service",
    reason,
    scope: meta.scope,
    subjectKind: meta.subjectKind,
    environment: (process.env.ENVIRONMENT ?? "").trim().toLowerCase() || "unknown",
  };
  if (isProductionRuntime()) {
    logError("rate_limit_redis_unavailable", fields);
    return;
  }
  logWarn("rate_limit_redis_unavailable", fields);
}

function pruneMemory(now: number): void {
  if (memory.size <= MAX_MEMORY_KEYS) return;
  for (const [k, b] of memory) {
    if (b.resetAt < now) memory.delete(k);
    if (memory.size <= MAX_MEMORY_KEYS * 0.7) break;
  }
}

function memoryFixedWindowConsume(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  pruneMemory(now);
  let bucket = memory.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    memory.set(key, bucket);
  }
  if (bucket.count >= max) {
    return {
      allowed: false,
      retryAfterMs: Math.max(0, bucket.resetAt - now),
      reason: "exceeded",
    };
  }
  bucket.count += 1;
  return { allowed: true };
}

async function getRedis(): Promise<RedisClient | null> {
  const client = await getSharedRedisClient();
  return client as RedisClient | null;
}

async function redisFixedWindowConsume(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult | null> {
  const client = await getRedis();
  if (!client) return null;

  try {
    const script = `
      local c = redis.call("INCR", KEYS[1])
      local ttl = redis.call("PTTL", KEYS[1])
      if ttl < 0 then
        redis.call("PEXPIRE", KEYS[1], ARGV[1])
        ttl = tonumber(ARGV[1])
      end
      return {c, ttl}
    `;
    const res = await client.eval(script, {
      keys: [key],
      arguments: [String(windowMs)],
    });
    if (!Array.isArray(res) || res.length < 2) {
      logRedisFailureOnce("invalid_eval_response", key);
      return null;
    }
    const count = Number(res[0]);
    const ttl = Number(res[1]);
    if (!Number.isFinite(count)) {
      logRedisFailureOnce("invalid_eval_count", key);
      return null;
    }
    if (count <= max) return { allowed: true };
    const retryAfterMs = ttl > 0 ? ttl : windowMs;
    return { allowed: false, retryAfterMs, reason: "exceeded" };
  } catch {
    logRedisFailureOnce("eval_failed", key);
    return null;
  }
}

/** Ключ субъекта: авторизованный пользователь или доверенный IP. */
export function rateLimitSubject(opts: { userId?: string | null; clientIp: string }): string {
  const uid = opts.userId?.trim();
  if (uid) return `user:${uid}`;
  const ip = opts.clientIp.trim() || "unknown";
  return `ip:${ip}`;
}

function buildRedisKey(scope: string, subject: string): string {
  return `rl:${scope}:${subject}`;
}

/**
 * Fixed-window limiter в Redis; в production без Redis — deny (fail-closed).
 */
export async function consumeRateLimitKey(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const redisResult = await redisFixedWindowConsume(key, max, windowMs);
  if (redisResult) return redisResult;

  if (!isDevMemoryFallbackAllowed()) {
    logError("rate_limit_denied_unavailable", {
      component: "rate_limit_service",
      reason: "redis_unavailable_production",
      ...rateLimitKeyMeta(key),
    });
    return { allowed: false, retryAfterMs: windowMs, reason: "unavailable" };
  }

  warnMemoryFallback("REDIS_URL unset or Redis unreachable");
  return memoryFixedWindowConsume(key, max, windowMs);
}

export async function enforceRateLimit(opts: {
  scope: string;
  userId?: string | null;
  clientIp: string;
  max: number;
  windowMs: number;
  /** Доп. измерение (например email при регистрации). */
  subjectOverride?: string;
}): Promise<RateLimitResult> {
  if (isAutomatedTestRuntime()) {
    return { allowed: true };
  }
  const subject = opts.subjectOverride ?? rateLimitSubject({ userId: opts.userId, clientIp: opts.clientIp });
  const key = buildRedisKey(opts.scope, subject);
  return consumeRateLimitKey(key, opts.max, opts.windowMs);
}

export function getMemoryRateLimitResetAt(key: string): number | null {
  const bucket = memory.get(key);
  return bucket?.resetAt ?? null;
}

/**
 * Синхронный in-memory limiter — **только development**.
 * В production всегда deny-all (fail-closed).
 *
 * @deprecated Не использовать в Server Actions, Route Handlers и middleware.
 * Используйте `enforceRateLimit` / `enforceServerActionRateLimit` (Redis async).
 */
export function consumeRateLimitSyncDevOnly_DEPRECATED_DO_NOT_USE_IN_SERVER_ACTIONS(
  key: string,
  max: number,
  windowMs: number,
): boolean {
  const normalized = key.startsWith("rl:") ? key : `rl:${key}`;
  if (!isDevMemoryFallbackAllowed()) {
    console.error("[rate-limit] sync limiter refused in production (use enforceRateLimit + Redis)");
    return false;
  }
  warnMemoryFallback("sync consumeRateLimit");
  return memoryFixedWindowConsume(normalized, max, windowMs).allowed;
}

/** Сброс singleton Redis (тесты). */
export function resetRateLimitServiceForTests(): void {
  resetSharedRedisClientForTests();
  memory.clear();
  memoryFallbackWarned = false;
  redisFailureWarned = false;
}

export { isDevMemoryFallbackAllowed, isProductionRuntime };
