import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { enforceRateLimit, resetRateLimitServiceForTests } from "@/lib/security/rate-limit-service";

const redisUrl = process.env.REDIS_URL?.trim();
const runRedisIntegration = Boolean(redisUrl);

describe.runIf(runRedisIntegration)("rate-limit Redis integration", () => {
  beforeEach(() => {
    resetRateLimitServiceForTests();
    process.env.ENVIRONMENT = "production";
    delete process.env.E2E_USE_SEED_CREDENTIALS;
    if (redisUrl) process.env.REDIS_URL = redisUrl;
  });

  afterEach(() => {
    resetRateLimitServiceForTests();
  });

  it("allows requests within policy when Redis is up (production mode)", async () => {
    const scope = `ci:redis:${Date.now()}`;
    const r = await enforceRateLimit({
      scope,
      clientIp: "203.0.113.50",
      max: 3,
      windowMs: 60_000,
    });
    expect(r.allowed).toBe(true);
  });

  it("denies when max exceeded (fixed window, no false unavailable)", async () => {
    const scope = `ci:redis:deny:${Date.now()}`;
    const opts = {
      scope,
      clientIp: "203.0.113.51",
      max: 1,
      windowMs: 60_000,
    };
    expect((await enforceRateLimit(opts)).allowed).toBe(true);
    const denied = await enforceRateLimit(opts);
    expect(denied.allowed).toBe(false);
    if (!denied.allowed) {
      expect(denied.reason).toBe("exceeded");
    }
  });
});
