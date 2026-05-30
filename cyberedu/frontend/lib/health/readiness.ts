import { prisma } from "@/lib/db";
import {
  consumeRateLimitKey,
  isMemoryFallbackAllowed,
  isProductionRuntime,
} from "@/lib/security/rate-limit-service";

export type ReadinessChecks = {
  database: "ok" | "error";
  redis: "ok" | "error" | "skipped";
  adminUser?: boolean;
  userCount?: number;
};

async function checkRedisReachable(): Promise<boolean> {
  if (!process.env.REDIS_URL?.trim()) return false;
  const probe = await consumeRateLimitKey("rl:health:probe", 1, 60_000);
  return probe.allowed || (!probe.allowed && probe.reason === "exceeded");
}

export async function runReadinessChecks(): Promise<ReadinessChecks> {
  let database: ReadinessChecks["database"] = "ok";
  let adminUser = false;
  let userCount = 0;
  try {
    await prisma.$queryRaw`SELECT 1`;
    userCount = await prisma.user.count();
    const admin = await prisma.user.findUnique({
      where: { email: "admin@cyberedu.local" },
      select: { id: true, passwordHash: true },
    });
    adminUser = Boolean(admin?.passwordHash);
  } catch {
    database = "error";
  }

  let redis: ReadinessChecks["redis"] = "skipped";
  if (isProductionRuntime()) {
    const redisUrl = process.env.REDIS_URL?.trim();
    if (!redisUrl) {
      redis = isMemoryFallbackAllowed() ? "skipped" : "error";
    } else {
      const reachable = await checkRedisReachable();
      redis = reachable ? "ok" : isMemoryFallbackAllowed() ? "skipped" : "error";
    }
  }

  return { database, redis, adminUser, userCount };
}

export function readinessStatus(checks: ReadinessChecks): "ok" | "degraded" {
  if (checks.database !== "ok") return "degraded";
  if (checks.redis === "error") return "degraded";
  return "ok";
}
