import { execSync } from "node:child_process";
import { config as loadEnv } from "dotenv";
import { request } from "@playwright/test";
import { getE2eCredentials } from "./test-credentials";

/** DATABASE_URL и прочее из `frontend/.env` (нужно для persistence-check в prod-smoke). */
loadEnv({ path: ".env", quiet: true });

const frontendRoot = process.cwd();

/** Сброс rate-limit перед prod-smoke (повторные прогоны). Только для изолированного Redis (CI / локальный e2e). */
function clearRateLimitKeys(redisUrl: string): void {
  execSync("node scripts/redis-flush-e2e.mjs", {
    cwd: frontendRoot,
    env: { ...process.env, REDIS_URL: redisUrl },
    stdio: "inherit",
  });
}

async function globalSetup(): Promise<void> {
  if (process.env.E2E_PRODUCTION_SMOKE !== "1") {
    throw new Error(
      "prod E2E: установите E2E_PRODUCTION_SMOKE=1 (изолированная CI/staging БД, не публичный prod).",
    );
  }

  const env = (process.env.ENVIRONMENT ?? "").trim().toLowerCase();
  if (env !== "production" && env !== "prod") {
    throw new Error(`prod E2E: ожидается ENVIRONMENT=production, получено: ${process.env.ENVIRONMENT ?? "(unset)"}`);
  }

  if (!process.env.REDIS_URL?.trim()) {
    throw new Error("prod E2E: REDIS_URL обязателен (реальный Redis, без in-memory bypass).");
  }

  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";
  const ctx = await request.newContext({ baseURL });

  const health = await ctx.get("/api/health");
  if (!health.ok()) {
    throw new Error(`prod E2E: /api/health → ${health.status()} (${baseURL})`);
  }

  const body = (await health.json()) as {
    status?: string;
    checks?: { database?: string; redis?: string };
  };

  if (body.status !== "ok") {
    throw new Error(`prod E2E: health status=${body.status} (ожидался ok)`);
  }
  if (body.checks?.database !== "ok") {
    throw new Error(`prod E2E: database check=${body.checks?.database} (ожидался ok)`);
  }
  if (body.checks?.redis !== "ok") {
    throw new Error(
      `prod E2E: redis check=${body.checks?.redis} (ожидался ok — rate limit fail-closed без Redis)`,
    );
  }

  const redisUrl = process.env.REDIS_URL!.trim();
  clearRateLimitKeys(redisUrl);

  getE2eCredentials("student");

  await ctx.dispose();
}

export default globalSetup;
