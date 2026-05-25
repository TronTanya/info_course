import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  certificate: { findUnique: vi.fn() },
}));

vi.mock("@/lib/db", () => ({ prisma }));

import { prisma as prismaClient } from "@/lib/db";
import { normalizePublicCertificateNumber } from "@/lib/certificate-verify-url";
import { resolveCertificateVerifyPayload } from "@/lib/certificate-verify";

const prismaMock = prismaClient as unknown as { certificate: { findUnique: ReturnType<typeof vi.fn> } };

const validCertRow = {
  id: "c1",
  certificateNumber: "CE-2026-OK123456",
  issuedAt: new Date("2026-05-01"),
  revokedAt: null,
  course: { title: "IB", hours: 80 },
  user: { profile: { lastName: "A", firstName: "B", middleName: null } },
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.certificate.findUnique.mockReset();
  delete process.env.CERTIFICATE_VERIFY_SHOW_HOLDER_NAME;
});

describe("resolveCertificateVerifyPayload", () => {
  it("returns not_found when missing", async () => {
    prismaMock.certificate.findUnique.mockResolvedValue(null);
    await expect(resolveCertificateVerifyPayload("abc")).resolves.toEqual({ status: "not_found" });
  });

  it("normalizes public certificate numbers", () => {
    expect(normalizePublicCertificateNumber("CE-2026-OK123456")).toBe("CE-2026-OK123456");
  });

  it("resolves by public certificate number", async () => {
    prismaMock.certificate.findUnique.mockResolvedValue(validCertRow);
    const r = await resolveCertificateVerifyPayload("CE-2026-OK123456");
    expect(r.status).toBe("valid");
    expect(prismaMock.certificate.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { certificateNumber: "CE-2026-OK123456" } }),
    );
  });

  it("returns revoked when revokedAt set", async () => {
    prismaMock.certificate.findUnique.mockResolvedValue({
      ...validCertRow,
      certificateNumber: "CE-2026-REVOKED1",
      revokedAt: new Date("2026-05-02"),
      course: { title: "Курс", hours: 120 },
    });
    const r = await resolveCertificateVerifyPayload("CE-2026-REVOKED1");
    expect(r.status).toBe("revoked");
    expect(r.certificateNumber).toBe("CE-2026-REVOKED1");
    expect(r.holderName).toBeUndefined();
  });

  it("returns valid via legacy verification code", async () => {
    const legacyHex = "a".repeat(36);
    prismaMock.certificate.findUnique.mockResolvedValue(validCertRow);
    const r = await resolveCertificateVerifyPayload(legacyHex);
    expect(r.status).toBe("valid");
    expect(prismaMock.certificate.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { verificationCode: legacyHex } }),
    );
  });
});
