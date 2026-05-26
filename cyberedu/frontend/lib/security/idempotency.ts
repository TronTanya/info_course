/**
 * Idempotency для Server Actions (Redis + dev in-memory).
 * Повтор с тем же ключом возвращает сохранённый результат без повторной записи в БД.
 */
import { isDevMemoryFallbackAllowed } from "@/lib/security/rate-limit-service";

const DEFAULT_TTL_MS = 60 * 60 * 1000;
const MAX_KEY_LEN = 128;
const KEY_RE = /^[a-zA-Z0-9_-]{8,128}$/;

type RedisStringClient = {
  get: (key: string) => Promise<string | null>;
  set: (
    key: string,
    value: string,
    options?: { NX?: boolean; EX?: number },
  ) => Promise<string | null>;
  connect: () => Promise<void>;
  on: (event: string, listener: () => void) => void;
};

let redisPromise: Promise<RedisStringClient | null> | null = null;

type MemoryEntry = { value: string; expiresAt: number };
const memoryResults = new Map<string, MemoryEntry>();
const memoryLocks = new Map<string, number>();

export function normalizeIdempotencyKey(raw: string | undefined | null): string | null {
  const s = raw?.trim();
  if (!s || s.length > MAX_KEY_LEN) return null;
  if (!KEY_RE.test(s)) return null;
  return s;
}

function resultKey(scope: string, idempotencyKey: string): string {
  return `idemp:result:${scope}:${idempotencyKey}`;
}

function lockKey(scope: string, idempotencyKey: string): string {
  return `idemp:lock:${scope}:${idempotencyKey}`;
}

async function getRedis(): Promise<RedisStringClient | null> {
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
        return client as unknown as RedisStringClient;
      } catch {
        return null;
      }
    })();
  }
  return redisPromise;
}

function pruneMemory(map: Map<string, MemoryEntry | number>, now: number): void {
  for (const [k, v] of map) {
    const exp = typeof v === "number" ? v : v.expiresAt;
    if (exp < now) map.delete(k);
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

export type IdempotencyReplay<T> = { replay: true; value: T };
export type IdempotencyFresh = { replay: false };

/**
 * Если ключ уже обработан — вернуть сохранённый JSON.
 * Иначе выполнить `run`, сохранить результат на TTL.
 */
export async function withIdempotency<T>(opts: {
  scope: string;
  idempotencyKey: string;
  ttlMs?: number;
  run: () => Promise<T>;
}): Promise<T> {
  const ttlMs = opts.ttlMs ?? DEFAULT_TTL_MS;
  const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));
  const rKey = resultKey(opts.scope, opts.idempotencyKey);
  const lKey = lockKey(opts.scope, opts.idempotencyKey);

  const redis = await getRedis();
  if (redis) {
    const cached = await redis.get(rKey);
    if (cached) {
      return JSON.parse(cached) as T;
    }

    const locked = await redis.set(lKey, "1", { NX: true, EX: ttlSec });
    if (!locked) {
      for (let i = 0; i < 8; i++) {
        await sleep(50 * (i + 1));
        const again = await redis.get(rKey);
        if (again) return JSON.parse(again) as T;
      }
      throw new Error("Запрос уже обрабатывается. Подождите несколько секунд.");
    }

    try {
      const result = await opts.run();
      await redis.set(rKey, JSON.stringify(result), { EX: ttlSec });
      return result;
    } finally {
      await redis.set(lKey, "0", { EX: 1 }).catch(() => undefined);
    }
  }

  if (!isDevMemoryFallbackAllowed()) {
    return opts.run();
  }

  const now = Date.now();
  pruneMemory(memoryResults, now);
  for (const [k, exp] of memoryLocks) {
    if (exp < now) memoryLocks.delete(k);
  }

  const memHit = memoryResults.get(rKey);
  if (memHit && memHit.expiresAt > now) {
    return JSON.parse(memHit.value) as T;
  }

  const lockUntil = memoryLocks.get(lKey);
  if (lockUntil && lockUntil > now) {
    for (let i = 0; i < 5; i++) {
      await sleep(40);
      const hit = memoryResults.get(rKey);
      if (hit && hit.expiresAt > Date.now()) return JSON.parse(hit.value) as T;
    }
    throw new Error("Запрос уже обрабатывается. Подождите несколько секунд.");
  }

  memoryLocks.set(lKey, now + 30_000);
  try {
    const result = await opts.run();
    memoryResults.set(rKey, { value: JSON.stringify(result), expiresAt: now + ttlMs });
    return result;
  } finally {
    memoryLocks.delete(lKey);
  }
}

/** Сброс singleton Redis (тесты). */
export function resetIdempotencyForTests(): void {
  redisPromise = null;
  memoryResults.clear();
  memoryLocks.clear();
}
