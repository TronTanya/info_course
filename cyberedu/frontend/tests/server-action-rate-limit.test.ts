import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enforceServerActionRateLimit } from "@/lib/security/server-action-rate-limit";
import { resetRateLimitServiceForTests } from "@/lib/security/rate-limit-service";

const redisCounts = new Map<string, number>();

vi.mock("redis", () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    incr: vi.fn(async (key: string) => {
      const next = (redisCounts.get(key) ?? 0) + 1;
      redisCounts.set(key, next);
      return next;
    }),
    pExpire: vi.fn().mockResolvedValue(1),
    pTTL: vi.fn().mockResolvedValue(60_000),
  })),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers({ "x-forwarded-for": "203.0.113.77" })),
}));

describe("enforceServerActionRateLimit", () => {
  const env = { ...process.env };

  beforeEach(() => {
    redisCounts.clear();
    resetRateLimitServiceForTests();
    process.env.REDIS_URL = "redis://127.0.0.1:6379";
    process.env.ENVIRONMENT = "production";
    process.env.TRUSTED_PROXY = "1";
  });

  afterEach(() => {
    process.env = { ...env };
    resetRateLimitServiceForTests();
    vi.clearAllMocks();
  });

  it("allows test submit in production when Redis is available (within limit)", async () => {
    const r = await enforceServerActionRateLimit("testSubmit", "user-prod-1", {
      exceeded: "Слишком много отправок теста.",
    });
    expect(r).toEqual({ allowed: true });
  });

  it("denies test submit when limit exceeded in production", async () => {
    const userId = "user-prod-limit";
    for (let i = 0; i < 40; i++) {
      const ok = await enforceServerActionRateLimit("testSubmit", userId);
      expect(ok.allowed).toBe(true);
    }
    const denied = await enforceServerActionRateLimit("testSubmit", userId, {
      exceeded: "Слишком много отправок теста.",
    });
    expect(denied.allowed).toBe(false);
    if (!denied.allowed) {
      expect(denied.error).toBe("Слишком много отправок теста.");
    }
  });

  it("returns unavailable error when Redis is down in production", async () => {
    delete process.env.REDIS_URL;
    resetRateLimitServiceForTests();
    const denied = await enforceServerActionRateLimit("practiceText", "user-no-redis");
    expect(denied.allowed).toBe(false);
    if (!denied.allowed) {
      expect(denied.error).toMatch(/временно недоступен/i);
    }
  });

  it("allows practice text and structured submits under separate scopes", async () => {
    const userId = "user-practice-scopes";
    const text = await enforceServerActionRateLimit("practiceText", userId);
    const structured = await enforceServerActionRateLimit("practiceStructured", userId);
    expect(text).toEqual({ allowed: true });
    expect(structured).toEqual({ allowed: true });
  });

  it("does not return unavailable when Redis is up and under limit (no false deny)", async () => {
    const results = await Promise.all([
      enforceServerActionRateLimit("testSubmit", "user-no-false-deny"),
      enforceServerActionRateLimit("practiceText", "user-no-false-deny"),
    ]);
    for (const r of results) {
      expect(r.allowed).toBe(true);
    }
  });
});
