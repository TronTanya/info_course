#!/usr/bin/env node
/**
 * Проверка доступности Redis перед staging/prod smoke (CI и локально).
 * Не использует mock — только реальный Redis.
 *
 * Usage:
 *   REDIS_URL=redis://127.0.0.1:6379 node scripts/redis-ping.mjs
 *   node scripts/redis-ping.mjs redis://127.0.0.1:6379
 */
import { createClient } from "redis";

const url = (process.argv[2] || process.env.REDIS_URL || "").trim();
if (!url) {
  console.error("redis-ping: REDIS_URL is not set (env or first argument)");
  process.exit(1);
}

const masked = url.replace(/:([^:@/]+)@/, ":***@");
const client = createClient({ url });

client.on("error", (err) => {
  console.error("redis-ping: connection error:", err.message);
  process.exit(1);
});

try {
  await client.connect();
  const reply = await client.ping();
  await client.quit();

  if (reply !== "PONG") {
    console.error(`redis-ping: unexpected reply: ${reply}`);
    process.exit(1);
  }

  console.log(`redis-ping: PONG ok (${masked})`);
} catch (err) {
  console.error("redis-ping: failed:", err instanceof Error ? err.message : err);
  process.exit(1);
}
