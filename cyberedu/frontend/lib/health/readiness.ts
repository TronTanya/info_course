import { prisma } from "@/lib/db";
import { consumeRateLimitKey, isProductionRuntime } from "@/lib/security/rate-limit-service";

export type ReadinessChecks = {
  database: "ok" | "error";
  redis: "ok" | "error" | "skipped";
};

async function checkRedisReachable(): Promise<boolean> {
  if (!process.env.REDIS_URL?.trim()) return false;
  const probe = await consumeRateLimitKey("rl:health:probe", 1, 60_000);
  return probe.allowed || (!probe.allowed && probe.reason === "exceeded");
}

export async function runReadinessChecks(): Promise<ReadinessChecks> {
  let database: ReadinessChecks["database"] = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }

  let redis: ReadinessChecks["redis"] = "skipped";
  if (isProductionRuntime()) {
    redis = (await checkRedisReachable()) ? "ok" : "error";
  }

  return { database, redis };
}

export function readinessStatus(checks: ReadinessChecks): "ok" | "degraded" {
  if (checks.database !== "ok") return "degraded";
  if (checks.redis === "error") return "degraded";
  return "ok";
}
