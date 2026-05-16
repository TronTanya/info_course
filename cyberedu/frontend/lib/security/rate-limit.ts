/**
 * Rate limiting: in-memory (single instance) + опционально Redis (REDIS_URL) для горизонтального масштаба.
 */

type Bucket = { count: number; resetAt: number };

const memory = new Map<string, Bucket>();
const MAX_KEYS = 25_000;

function pruneMemory(now: number) {
  if (memory.size <= MAX_KEYS) return;
  for (const [k, b] of memory) {
    if (b.resetAt < now) memory.delete(k);
    if (memory.size <= MAX_KEYS * 0.7) break;
  }
}

function memoryConsume(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  pruneMemory(now);
  let b = memory.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    memory.set(key, b);
  }
  if (b.count >= max) return false;
  b.count += 1;
  return true;
}

type RedisClient = {
  incr: (key: string) => Promise<number>;
  pExpire: (key: string, ms: number) => Promise<boolean>;
  connect: () => Promise<void>;
};

let redisPromise: Promise<RedisClient | null> | null = null;

async function getRedis(): Promise<RedisClient | null> {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (!redisPromise) {
    redisPromise = (async () => {
      try {
        // optionalDependency `redis` — при отсутствии пакета остаётся in-memory limiter
        const redisMod = (await import("redis")) as typeof import("redis");
        const { createClient } = redisMod;
        const client = createClient({ url });
        client.on("error", () => {
          /* fallback to memory on redis errors */
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

async function redisConsume(key: string, max: number, windowMs: number): Promise<boolean | null> {
  const client = await getRedis();
  if (!client) return null;
  try {
    const rlKey = `rl:${key}`;
    const count = await client.incr(rlKey);
    if (count === 1) {
      await client.pExpire(rlKey, windowMs);
    }
    return count <= max;
  } catch {
    return null;
  }
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterMs: number };

/**
 * @returns allowed — можно обрабатывать запрос
 */
export async function consumeRateLimitAsync(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const redisOk = await redisConsume(key, max, windowMs);
  const allowed = redisOk ?? memoryConsume(key, max, windowMs);
  if (allowed) return { allowed: true };
  const b = memory.get(key);
  const retryAfterMs = b ? Math.max(0, b.resetAt - Date.now()) : windowMs;
  return { allowed: false, retryAfterMs };
}

/** Синхронная обёртка (middleware Edge — только memory). */
export function consumeRateLimit(key: string, max: number, windowMs: number): boolean {
  return memoryConsume(key, max, windowMs);
}

export function getRateLimitResetAt(key: string): number | null {
  const b = memory.get(key);
  return b?.resetAt ?? null;
}

/** Составной ключ: IP + user (если есть). */
export async function consumeCompositeRateLimit(opts: {
  ipKey: string;
  userKey?: string;
  ipMax: number;
  userMax?: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  const ip = await consumeRateLimitAsync(opts.ipKey, opts.ipMax, opts.windowMs);
  if (!ip.allowed) return ip;
  if (opts.userKey && opts.userMax != null) {
    return consumeRateLimitAsync(opts.userKey, opts.userMax, opts.windowMs);
  }
  return { allowed: true };
}
