import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearLoginAttempts,
  isLoginLocked,
  LOGIN_LOCKOUT_MAX_FAILURES,
  recordFailedLogin,
  resetLoginLockoutStoreForTests,
} from "@/lib/security/login-attempts";
import { resetRateLimitServiceForTests } from "@/lib/security/rate-limit-service";

const store = new Map<string, string>();

vi.mock("redis", () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    incr: vi.fn(async (key: string) => {
      const n = Number(store.get(key) ?? "0") + 1;
      store.set(key, String(n));
      return n;
    }),
    pExpire: vi.fn().mockResolvedValue(1),
    pTTL: vi.fn().mockResolvedValue(60_000),
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
      return "OK";
    }),
    del: vi.fn(async (keys: string | string[]) => {
      const list = Array.isArray(keys) ? keys : [keys];
      for (const k of list) store.delete(k);
      return list.length;
    }),
  })),
}));

describe("security/login-lockout redis", () => {
  const env = { ...process.env };

  beforeEach(() => {
    store.clear();
    resetRateLimitServiceForTests();
    resetLoginLockoutStoreForTests();
    vi.stubEnv("REDIS_URL", "redis://127.0.0.1:6379");
    vi.stubEnv("ENVIRONMENT", "production");
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("E2E_USE_SEED_CREDENTIALS", "");
  });

  afterEach(() => {
    process.env = { ...env };
    resetRateLimitServiceForTests();
    resetLoginLockoutStoreForTests();
  });

  it("persists lockout in Redis across memory reset", async () => {
    const email = "redis-lock@example.com";
    const ip = "203.0.113.50";
    await clearLoginAttempts(email, ip);

    for (let i = 0; i < LOGIN_LOCKOUT_MAX_FAILURES; i++) {
      await recordFailedLogin(email, ip);
    }
    expect(await isLoginLocked(email, ip)).toBe(true);

    resetLoginLockoutStoreForTests();
    expect(await isLoginLocked(email, ip)).toBe(true);

    await clearLoginAttempts(email, ip);
    expect(await isLoginLocked(email, ip)).toBe(false);
  });
});
