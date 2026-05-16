/**
 * Простое in-memory ограничение частоты (окно фиксированной длительности).
 * Для нескольких инстансов сервера нужен общий стор (Redis и т.п.).
 */
type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

const MAX_KEYS = 20_000;

function prune(now: number) {
  if (store.size <= MAX_KEYS) return;
  for (const [k, b] of store) {
    if (b.resetAt < now) store.delete(k);
    if (store.size <= MAX_KEYS * 0.7) break;
  }
}

/**
 * @returns true если запрос разрешён (счётчик увеличен).
 */
export function consumeRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  prune(now);

  let b = store.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    store.set(key, b);
  }
  if (b.count >= max) return false;
  b.count += 1;
  return true;
}

export function getRateLimitResetAt(key: string): number | null {
  const b = store.get(key);
  if (!b) return null;
  return b.resetAt;
}
