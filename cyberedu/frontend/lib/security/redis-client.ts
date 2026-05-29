type RedisLike = {
  connect: () => Promise<void>;
  on: (event: string, listener: () => void) => void;
};

const CONNECT_TIMEOUT_MS = 2_500;

let connectPromise: Promise<RedisLike | null> | null = null;

async function connectWithTimeout(client: RedisLike, url: string): Promise<RedisLike | null> {
  try {
    await Promise.race([
      client.connect(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("redis_connect_timeout")), CONNECT_TIMEOUT_MS);
      }),
    ]);
    return client;
  } catch {
    console.error(`[redis] connect failed or timed out (${CONNECT_TIMEOUT_MS}ms)`);
    return null;
  }
}

/** Shared lazy Redis client for rate limits and login lockout. */
export async function getSharedRedisClient(): Promise<RedisLike | null> {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (!connectPromise) {
    connectPromise = (async () => {
      try {
        const redisMod = (await import("redis")) as typeof import("redis");
        const client = redisMod.createClient({ url }) as unknown as RedisLike;
        client.on("error", () => {
          /* per-request fallback */
        });
        return await connectWithTimeout(client, url);
      } catch {
        return null;
      }
    })();
  }
  return connectPromise;
}

/** Reset singleton (tests). */
export function resetSharedRedisClientForTests(): void {
  connectPromise = null;
}
