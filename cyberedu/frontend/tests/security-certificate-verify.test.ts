import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enforceRateLimit, RATE_LIMIT_POLICIES, resetRateLimitServiceForTests } from "@/lib/security/rate-limit-service";

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

describe("security/certificate verify", () => {
  const env = { ...process.env };
  const verifyPagePath = join(process.cwd(), "app/verify/[certificateNumber]/page.tsx");
  const legacyVerifyPagePath = join(
    process.cwd(),
    "app/certificate/verify/[verificationCode]/page.tsx",
  );

  beforeEach(() => {
    redisCounts.clear();
    resetRateLimitServiceForTests();
    process.env.REDIS_URL = "redis://127.0.0.1:6379";
    process.env.ENVIRONMENT = "production";
  });

  afterEach(() => {
    process.env = { ...env };
    resetRateLimitServiceForTests();
  });

  it("rate limit policy blocks excessive verify lookups", async () => {
    const policy = RATE_LIMIT_POLICIES.certVerify;
    const ip = "203.0.113.88";

    for (let i = 0; i < policy.max; i++) {
      const ok = await enforceRateLimit({
        scope: policy.scope,
        clientIp: ip,
        max: policy.max,
        windowMs: policy.windowMs,
      });
      expect(ok.allowed).toBe(true);
    }

    const denied = await enforceRateLimit({
      scope: policy.scope,
      clientIp: ip,
      max: policy.max,
      windowMs: policy.windowMs,
    });
    expect(denied.allowed).toBe(false);
    if (!denied.allowed) expect(denied.reason).toBe("exceeded");
  });

  it("verify page shows safe not-found message (no internal leaks)", () => {
    const src = readFileSync(verifyPagePath, "utf8");
    expect(src).toContain("runPublicCertificateVerify");
    expect(src).not.toMatch(/PrismaClient|stack trace|DATABASE_URL/i);
    expect(src).not.toContain("profile.lastName");

    const legacy = readFileSync(legacyVerifyPagePath, "utf8");
    expect(legacy).toContain("normalizePublicCertificateNumber");
    expect(legacy).toContain("runPublicCertificateVerify");
    expect(legacy).not.toMatch(/PrismaClient|stack trace|DATABASE_URL/i);

    const flowSrc = readFileSync(join(process.cwd(), "lib/certificate-verify-page.ts"), "utf8");
    expect(flowSrc).toContain("not_found");
    expect(flowSrc).toContain("rate_limited");
  });

  it("verify page shows valid certificate status without exposing profile name", () => {
    const viewSrc = readFileSync(
      join(process.cwd(), "components/certificate/certificate-verify-view.tsx"),
      "utf8",
    );
    expect(viewSrc).toContain("Сертификат подтверждён");
    expect(viewSrc).toContain("Сертификат отозван");
    const metaSrc = readFileSync(join(process.cwd(), "lib/certificate-ui-states.ts"), "utf8");
    expect(metaSrc).toContain("Сертификат не найден");
    expect(viewSrc).toContain("CertificatePublicNotFoundState");
    expect(viewSrc).toContain("Срок действия сертификата истёк");
    expect(viewSrc).toContain("verificationMessage");
    expect(viewSrc).toMatch(/реестр|CyberEdu Academy/i);
    expect(viewSrc).not.toMatch(/lastName|firstName|userId|submission|progressPercent|scoreSuccess/i);
  });
});
