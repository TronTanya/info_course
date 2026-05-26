import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => vi.fn());
const headersMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());
const enforceRateLimitMock = vi.hoisted(() => vi.fn());
const clientIpFromHeadersMock = vi.hoisted(() => vi.fn());
const securityLogMock = vi.hoisted(() => vi.fn());
const sendAuthEmailMock = vi.hoisted(() => vi.fn());
const getSmtpConfigMock = vi.hoisted(() => vi.fn());
const isProductionRuntimeMock = vi.hoisted(() => vi.fn());
const appOriginMock = vi.hoisted(() => vi.fn());

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  verificationToken: { deleteMany: vi.fn(), create: vi.fn(), findFirst: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("next/headers", () => ({ headers: headersMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/lib/security/rate-limit", () => ({
  enforceRateLimit: enforceRateLimitMock,
  RATE_LIMIT_POLICIES: { registerIp: { max: 8, windowMs: 3600000 } },
}));
vi.mock("@/lib/security/request-ip", () => ({ clientIpFromHeaders: clientIpFromHeadersMock }));
vi.mock("@/lib/security-log", () => ({ securityLog: securityLogMock }));
vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/email-delivery", () => ({
  sendAuthEmail: sendAuthEmailMock,
  getSmtpConfig: getSmtpConfigMock,
  isProductionRuntime: isProductionRuntimeMock,
  appOrigin: appOriginMock,
}));

import { sendVerificationEmailAction, verifyEmailToken } from "@/lib/actions/email-verification";

describe("email verification actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redirectMock.mockImplementation(() => {
      throw new Error("REDIRECT");
    });
    headersMock.mockResolvedValue(new Headers());
    clientIpFromHeadersMock.mockReturnValue("203.0.113.7");
    enforceRateLimitMock.mockResolvedValue({ allowed: true });
    authMock.mockResolvedValue({ user: { id: "u1" } });
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => Promise<void>) => {
      await fn(prismaMock);
    });
    appOriginMock.mockReturnValue("https://app.example.com");
    getSmtpConfigMock.mockReturnValue({ host: "smtp" });
    isProductionRuntimeMock.mockReturnValue(true);
    sendAuthEmailMock.mockResolvedValue(true);
  });

  it("sendVerificationEmailAction redirects to login when unauthenticated", async () => {
    authMock.mockResolvedValue(null);
    await expect(sendVerificationEmailAction()).rejects.toThrow("REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/auth/login?callbackUrl=/auth/verify-email");
  });

  it("sendVerificationEmailAction creates token and sends email for unverified user", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "u@example.com",
      emailVerified: null,
    });

    await expect(sendVerificationEmailAction()).rejects.toThrow("REDIRECT");

    expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalled();
    expect(prismaMock.verificationToken.create).toHaveBeenCalled();
    expect(sendAuthEmailMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/auth/verify-email?sent=ok");
  });

  it("verifyEmailToken returns expired when token is old", async () => {
    prismaMock.verificationToken.findFirst.mockResolvedValue({
      identifier: "email_verify:u1",
      expires: new Date(Date.now() - 10_000),
    });
    const result = await verifyEmailToken("any-token");
    expect(result).toEqual({ ok: false, reason: "expired" });
  });

  it("verifyEmailToken marks user verified and consumes token", async () => {
    prismaMock.verificationToken.findFirst.mockResolvedValue({
      identifier: "email_verify:u1",
      expires: new Date(Date.now() + 10_000),
    });
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", emailVerified: null });

    const result = await verifyEmailToken("valid-token");
    expect(result).toEqual({ ok: true, userId: "u1" });
    expect(prismaMock.user.update).toHaveBeenCalled();
    expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalled();
  });
});
