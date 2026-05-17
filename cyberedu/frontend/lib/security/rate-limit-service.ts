/**
 * Централизованный rate limiter: Redis (fixed window + TTL), in-memory только в dev с warning.
 */

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
} as const;

type MemoryBucket = { count: number; resetAt: number };

const memory = new Map<string, MemoryBucket>();
const MAX_MEMORY_KEYS = 25_000;
let memoryFallbackWarned = false;

type RedisClient = {
  incr: (key: string) => Promise<number>;
  pExpire: (key: string, ms: number) => Promise<number>;
  pTTL: (key: string) => Promise<number>;
  connect: () => Promise<void>;
  on: (event: string, listener: () => void) => void;
};

let redisPromise: Promise<RedisClient | null> | null = null;

function isProductionRuntime(): boolean {
  const environment = (process.env.ENVIRONMENT ?? "").trim().toLowerCase();
  return environment === "production" || environment === "prod";
}

function isDevMemoryFallbackAllowed(): boolean {
  return !isProductionRuntime();
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
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (!redisPromise) {
    redisPromise = (async () => {
      try {
        const redisMod = (await import("redis")) as typeof import("redis");
        const client = redisMod.createClient({ url });
        client.on("error", () => {
          /* per-request fallback */
        });
        await client.connect();
        return client as unknown as RedisClient;
      } catch {
        return null;
      }
    })();
  }
  return redisPromise;
}

async function redisFixedWindowConsume(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult | null> {
  const client = await getRedis();
  if (!client) return null;

  try {
    const count = await client.incr(key);
    if (count === 1) {
      await client.pExpire(key, windowMs);
    }
    if (count <= max) return { allowed: true };
    const ttl = await client.pTTL(key);
    const retryAfterMs = ttl > 0 ? ttl : windowMs;
    return { allowed: false, retryAfterMs, reason: "exceeded" };
  } catch {
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
    console.error("[rate-limit] Redis unavailable in production — request denied");
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
  redisPromise = null;
  memory.clear();
  memoryFallbackWarned = false;
}

export { isDevMemoryFallbackAllowed, isProductionRuntime };
