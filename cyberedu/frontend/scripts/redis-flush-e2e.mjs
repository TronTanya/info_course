#!/usr/bin/env node
/**
 * Очистка Redis перед prod-smoke (изолированный инстанс e2e/staging).
 * Usage: REDIS_URL=redis://127.0.0.1:6379 node scripts/redis-flush-e2e.mjs
 */
import { createClient } from "redis";

const url = (process.argv[2] || process.env.REDIS_URL || "").trim();
if (!url) {
  console.error("redis-flush-e2e: REDIS_URL is not set");
  process.exit(1);
}

const client = createClient({ url });
await client.connect();
try {
  await client.flushDb();
  console.log("redis-flush-e2e: OK");
} finally {
  await client.quit();
}
