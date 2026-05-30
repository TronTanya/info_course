import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  user: {
    count: vi.fn(),
    findUnique: vi.fn(),
  },
}));

const consumeRateLimitKeyMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

vi.mock("@/lib/security/rate-limit-service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/security/rate-limit-service")>();
  return {
    ...actual,
    consumeRateLimitKey: consumeRateLimitKeyMock,
  };
});

import { runReadinessChecks } from "@/lib/health/readiness";

describe("runReadinessChecks", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env = { ...env };
    prismaMock.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    prismaMock.user.count.mockResolvedValue(266);
    prismaMock.user.findUnique.mockResolvedValue({ id: "admin", passwordHash: "hash" });
    consumeRateLimitKeyMock.mockReset();
  });

  afterEach(() => {
    process.env = env;
  });

  it("returns redis skipped outside production", async () => {
    process.env.ENVIRONMENT = "development";
    delete process.env.REDIS_URL;
    const checks = await runReadinessChecks();
    expect(checks.database).toBe("ok");
    expect(checks.redis).toBe("skipped");
    expect(consumeRateLimitKeyMock).not.toHaveBeenCalled();
  });

  it("returns redis ok in production when probe succeeds", async () => {
    process.env.ENVIRONMENT = "production";
    process.env.REDIS_URL = "redis://redis:6379";
    consumeRateLimitKeyMock.mockResolvedValue({ allowed: true });
    const checks = await runReadinessChecks();
    expect(checks.redis).toBe("ok");
    expect(consumeRateLimitKeyMock).toHaveBeenCalledWith("rl:health:probe", 1, 60_000);
  });

  it("returns redis error in production when probe unavailable", async () => {
    process.env.ENVIRONMENT = "production";
    process.env.REDIS_URL = "redis://redis:6379";
    delete process.env.VERCEL;
    consumeRateLimitKeyMock.mockResolvedValue({
      allowed: false,
      retryAfterMs: 60_000,
      reason: "unavailable",
    });
    const checks = await runReadinessChecks();
    expect(checks.redis).toBe("error");
  });

  it("returns redis skipped on Vercel without Redis URL", async () => {
    process.env.ENVIRONMENT = "production";
    process.env.VERCEL = "1";
    delete process.env.REDIS_URL;
    const checks = await runReadinessChecks();
    expect(checks.redis).toBe("skipped");
    expect(consumeRateLimitKeyMock).not.toHaveBeenCalled();
  });

  it("returns redis skipped on Vercel when Redis probe fails", async () => {
    process.env.ENVIRONMENT = "production";
    process.env.VERCEL = "1";
    process.env.REDIS_URL = "redis://127.0.0.1:6379";
    consumeRateLimitKeyMock.mockResolvedValue({
      allowed: false,
      retryAfterMs: 60_000,
      reason: "unavailable",
    });
    const checks = await runReadinessChecks();
    expect(checks.redis).toBe("skipped");
  });

  it("returns database error when prisma fails", async () => {
    process.env.ENVIRONMENT = "development";
    prismaMock.$queryRaw.mockRejectedValue(new Error("db down"));
    const checks = await runReadinessChecks();
    expect(checks.database).toBe("error");
  });
});
