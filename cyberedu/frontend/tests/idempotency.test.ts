import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeIdempotencyKey, resetIdempotencyForTests, withIdempotency } from "@/lib/security/idempotency";

describe("security/idempotency", () => {
  beforeEach(() => {
    resetIdempotencyForTests();
    vi.stubEnv("ENVIRONMENT", "development");
    delete process.env.REDIS_URL;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("normalizeIdempotencyKey accepts uuid-like keys", () => {
    const key = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
    expect(normalizeIdempotencyKey(key)).toBe(key);
    expect(normalizeIdempotencyKey("short")).toBeNull();
  });

  it("withIdempotency fails closed in production without Redis", async () => {
    vi.stubEnv("ENVIRONMENT", "production");
    delete process.env.REDIS_URL;

    await expect(
      withIdempotency({
        scope: "test",
        idempotencyKey: "idem-key-12345678",
        run: vi.fn().mockResolvedValue({ ok: true }),
      }),
    ).rejects.toThrow(/временно недоступен/i);
  });

  it("withIdempotency returns cached result on second call (memory)", async () => {
    const run = vi.fn().mockResolvedValue({ ok: true, n: 1 });
    const opts = { scope: "test", idempotencyKey: "idem-key-12345678", run };

    const first = await withIdempotency(opts);
    const second = await withIdempotency(opts);

    expect(first).toEqual({ ok: true, n: 1 });
    expect(second).toEqual({ ok: true, n: 1 });
    expect(run).toHaveBeenCalledTimes(1);
  });
});
