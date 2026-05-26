import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceRateLimitMock = vi.hoisted(() => vi.fn());
const headersMock = vi.hoisted(() => vi.fn());
const clientIpFromHeadersMock = vi.hoisted(() => vi.fn());
const securityLogMock = vi.hoisted(() => vi.fn());
const bcryptHashMock = vi.hoisted(() => vi.fn());
const sendMailMock = vi.hoisted(() => vi.fn());
const createTransportMock = vi.hoisted(() => vi.fn(() => ({ sendMail: sendMailMock })));

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  verificationToken: {
    deleteMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/security/rate-limit", () => ({
  enforceRateLimit: enforceRateLimitMock,
  RATE_LIMIT_POLICIES: {
    registerIp: { max: 8, windowMs: 60 * 60 * 1000 },
  },
}));
vi.mock("next/headers", () => ({ headers: headersMock }));
vi.mock("@/lib/security/request-ip", () => ({ clientIpFromHeaders: clientIpFromHeadersMock }));
vi.mock("@/lib/security-log", () => ({ securityLog: securityLogMock }));
vi.mock("bcryptjs", () => ({ default: { hash: bcryptHashMock } }));
vi.mock("nodemailer", () => ({ createTransport: createTransportMock }));
vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

import { requestPasswordResetAction, resetPasswordAction } from "@/lib/actions/password-reset";

describe("password reset actions", () => {
  const env = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...env };
    headersMock.mockResolvedValue(new Headers());
    clientIpFromHeadersMock.mockReturnValue("203.0.113.5");
    enforceRateLimitMock.mockResolvedValue({ allowed: true });
    bcryptHashMock.mockResolvedValue("hashed-password");
    sendMailMock.mockResolvedValue(undefined);
    prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => Promise<void>) => {
      await fn(prismaMock);
    });
  });

  it("returns temporary unavailable in production without SMTP config", async () => {
    process.env.ENVIRONMENT = "production";
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", email: "u@example.com" });

    const fd = new FormData();
    fd.set("email", "u@example.com");
    const result = await requestPasswordResetAction({}, fd);

    expect(result.ok).toBeUndefined();
    expect(result.errors?._form?.[0]).toMatch(/временно недоступен/i);
    expect(prismaMock.verificationToken.create).not.toHaveBeenCalled();
  });

  it("creates reset token and sends email when SMTP is configured", async () => {
    process.env.ENVIRONMENT = "production";
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "mailer";
    process.env.SMTP_PASS = "secret";
    process.env.SMTP_FROM = "noreply@example.com";
    process.env.AUTH_URL = "https://app.example.com";
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", email: "u@example.com" });

    const fd = new FormData();
    fd.set("email", "u@example.com");
    const result = await requestPasswordResetAction({}, fd);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalled();
    expect(prismaMock.verificationToken.create).toHaveBeenCalled();
    expect(createTransportMock).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalled();
  });

  it("rejects reset with invalid token", async () => {
    prismaMock.verificationToken.findFirst.mockResolvedValue(null);

    const fd = new FormData();
    fd.set("token", "bad-token");
    fd.set("password", "abc12345Q");
    fd.set("confirmPassword", "abc12345Q");
    const result = await resetPasswordAction({}, fd);

    expect(result.ok).toBeUndefined();
    expect(result.errors?._form?.[0]).toMatch(/недействительна|истекла/i);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("updates password and consumes token on valid reset", async () => {
    prismaMock.verificationToken.findFirst.mockResolvedValue({
      identifier: "password_reset:u1",
      expires: new Date(Date.now() + 60_000),
    });

    const fd = new FormData();
    fd.set("token", "valid-token");
    fd.set("password", "abc12345Q");
    fd.set("confirmPassword", "abc12345Q");
    const result = await resetPasswordAction({}, fd);

    expect(result).toEqual({ ok: true });
    expect(bcryptHashMock).toHaveBeenCalled();
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { passwordHash: "hashed-password" },
    });
    expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: "password_reset:u1" },
    });
  });
});
