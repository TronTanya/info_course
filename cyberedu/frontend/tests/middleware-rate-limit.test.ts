import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { applyMiddlewareRateLimit } from "@/lib/security/middleware-rate-limit";
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

function credentialsPost(): NextRequest {
  return {
    method: "POST",
    headers: new Headers({ "x-forwarded-for": "203.0.113.55" }),
    nextUrl: new URL("http://localhost:3100/api/auth/callback/credentials"),
  } as NextRequest;
}

describe("middleware rate limit (async Redis)", () => {
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
  });

  it("does not block credentials callback in production when Redis is available", async () => {
    const block = await applyMiddlewareRateLimit(credentialsPost());
    expect(block).toBeNull();
  });

  it("returns 429 when credentials callback limit exceeded", async () => {
    for (let i = 0; i < 20; i++) {
      const ok = await applyMiddlewareRateLimit(credentialsPost());
      expect(ok).toBeNull();
    }
    const block = await applyMiddlewareRateLimit(credentialsPost());
    expect(block).toEqual({
      status: 429,
      body: { error: "Слишком много попыток входа. Подождите несколько минут." },
    });
  });

  it("ignores non-credentials routes (AI limits live in route handlers)", async () => {
    const aiReq = {
      method: "POST",
      headers: new Headers(),
      nextUrl: new URL("http://localhost:3100/api/ai/chat"),
    } as NextRequest;
    expect(await applyMiddlewareRateLimit(aiReq)).toBeNull();
  });

  it("middleware.ts does not import sync consumeRateLimit", () => {
    const src = readFileSync(join(process.cwd(), "middleware.ts"), "utf8");
    expect(src).not.toMatch(/consumeRateLimit/);
    expect(src).toMatch(/applyMiddlewareRateLimit/);
  });
});
