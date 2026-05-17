import { prisma } from "@/lib/db";

export type ReadinessChecks = {
  database: "ok" | "error";
};

export async function runReadinessChecks(): Promise<ReadinessChecks> {
  let database: ReadinessChecks["database"] = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }
  return { database };
}

export function readinessStatus(checks: ReadinessChecks): "ok" | "degraded" {
  return checks.database === "ok" ? "ok" : "degraded";
}
