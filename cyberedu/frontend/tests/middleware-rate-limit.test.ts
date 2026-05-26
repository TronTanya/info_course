import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { checkCredentialsCallbackRateLimit } from "@/lib/security/login-attempts";
import { resetRateLimitServiceForTests } from "@/lib/security/rate-limit-service";

const redisCounts = new Map<string, number>();

vi.mock("redis", () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    eval: vi.fn(async (_script: string, options: { keys: string[] }) => {
      const key = options.keys[0] ?? "unknown";
      const next = (redisCounts.get(key) ?? 0) + 1;
      redisCounts.set(key, next);
      return [next, 60_000];
    }),
  })),
}));

describe("credentials callback rate limit (Node.js + Redis)", () => {
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

  it("allows credentials callback when Redis is available", async () => {
    const rl = await checkCredentialsCallbackRateLimit("203.0.113.55");
    expect(rl).toEqual({ ok: true });
  });

  it("blocks after credentials callback limit exceeded", async () => {
    for (let i = 0; i < 20; i++) {
      expect(await checkCredentialsCallbackRateLimit("203.0.113.55")).toEqual({ ok: true });
    }
    expect(await checkCredentialsCallbackRateLimit("203.0.113.55")).toEqual({ ok: false });
  });

  it("middleware.ts does not rate-limit in Edge (limits live in authorize)", () => {
    const src = readFileSync(join(process.cwd(), "middleware.ts"), "utf8");
    expect(src).not.toMatch(/applyMiddlewareRateLimit/);
    expect(src).not.toMatch(/consumeRateLimit\(/);
    expect(src).not.toMatch(/consumeRateLimitSyncDevOnly/);
  });
});
