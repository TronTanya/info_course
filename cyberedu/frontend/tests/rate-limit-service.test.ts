import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  consumeRateLimitKey,
  enforceRateLimit,
  rateLimitSubject,
  resetRateLimitServiceForTests,
} from "@/lib/security/rate-limit-service";
import {
  clientIpFromHeaders,
  isTrustedProxyEnabled,
  isValidClientIp,
} from "@/lib/security/request-ip";

describe("security/request-ip", () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it("ignores X-Forwarded-For without TRUSTED_PROXY", () => {
    process.env.TRUSTED_PROXY = "0";
    const h = new Headers({ "x-forwarded-for": "203.0.113.50, 10.0.0.1" });
    expect(clientIpFromHeaders(h)).toBe("direct");
  });

  it("uses first valid IP from X-Forwarded-For when TRUSTED_PROXY=1", () => {
    process.env.TRUSTED_PROXY = "1";
    const h = new Headers({ "x-forwarded-for": "203.0.113.50, 10.0.0.1" });
    expect(clientIpFromHeaders(h)).toBe("203.0.113.50");
  });

  it("rejects invalid forwarded IP", () => {
    process.env.TRUSTED_PROXY = "1";
    const h = new Headers({ "x-forwarded-for": "not-an-ip" });
    expect(clientIpFromHeaders(h)).toBe("direct");
  });

  it("validates IPv4", () => {
    expect(isValidClientIp("192.168.1.1")).toBe(true);
    expect(isValidClientIp("999.1.1.1")).toBe(false);
  });
});

describe("security/rate-limit-service", () => {
  const env = { ...process.env };

  beforeEach(() => {
    resetRateLimitServiceForTests();
    delete process.env.REDIS_URL;
    process.env.ENVIRONMENT = "development";
  });

  afterEach(() => {
    process.env = { ...env };
    resetRateLimitServiceForTests();
  });

  it("rateLimitSubject prefers userId over IP", () => {
    expect(rateLimitSubject({ userId: "u1", clientIp: "203.0.113.1" })).toBe("user:u1");
    expect(rateLimitSubject({ clientIp: "203.0.113.1" })).toBe("ip:203.0.113.1");
  });

  it("allows requests within dev in-memory window", async () => {
    const key = "rl:test:dev:ip:127.0.0.1";
    const r1 = await consumeRateLimitKey(key, 2, 60_000);
    const r2 = await consumeRateLimitKey(key, 2, 60_000);
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });

  it("blocks when max exceeded in dev in-memory window", async () => {
    const key = "rl:test:dev:block:ip:127.0.0.2";
    await consumeRateLimitKey(key, 1, 60_000);
    const denied = await consumeRateLimitKey(key, 1, 60_000);
    expect(denied.allowed).toBe(false);
    if (!denied.allowed) {
      expect(denied.retryAfterMs).toBeGreaterThan(0);
      expect(denied.reason).toBe("exceeded");
    }
  });

  it("denies in production when Redis is unavailable", async () => {
    process.env.ENVIRONMENT = "production";
    const warn = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const denied = await enforceRateLimit({
      scope: "test:prod",
      clientIp: "203.0.113.9",
      max: 5,
      windowMs: 60_000,
    });
    expect(denied.allowed).toBe(false);
    if (!denied.allowed) {
      expect(denied.reason).toBe("unavailable");
    }
    warn.mockRestore();
  });

  it("supports subjectOverride for email dimension", async () => {
    const r = await enforceRateLimit({
      scope: "auth:register:email",
      clientIp: "direct",
      max: 1,
      windowMs: 60_000,
      subjectOverride: "email:test@example.com",
    });
    expect(r.allowed).toBe(true);
  });
});

describe("isTrustedProxyEnabled", () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it("returns true for TRUSTED_PROXY=1", () => {
    process.env.TRUSTED_PROXY = "1";
    expect(isTrustedProxyEnabled()).toBe(true);
  });
});
