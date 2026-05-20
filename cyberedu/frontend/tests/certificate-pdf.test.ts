import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import { CertificatePdfDocument, type CertificatePdfPayload } from "@/lib/certificate-pdf";
import { registerCertificatePdfFonts, resolveCertificatePdfFont } from "@/lib/certificate-pdf-fonts";

function samplePayload(): CertificatePdfPayload {
  const now = new Date("2026-05-01T12:00:00.000Z");
  return {
    fullName: "Иванов Иван Иванович",
    courseTitle: "Основы информационной безопасности",
    courseHours: 36,
    courseStartedAt: now,
    courseCompletedAt: now,
    totalScore: 720,
    certificateNumber: "CE-2026-TESTPDF1",
    verificationCode: "deadbeef",
    verifyUrl: "http://127.0.0.1:3100/certificate/verify/deadbeef",
    issuedAt: now,
    organizationLine: "CyberEdu Academy",
    signatoryLine: "Руководитель образовательной платформы",
    qrDataUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  };
}

describe("CertificatePdfDocument", () => {
  it("resolves DejaVu TTF fonts on disk", () => {
    expect(resolveCertificatePdfFont("regular")).toMatch(/DejaVuSans\.ttf$/);
    expect(resolveCertificatePdfFont("bold")).toMatch(/DejaVuSans-Bold\.ttf$/);
  });

  it("renders PDF buffer with Cyrillic (WOFF fonts, not WOFF2)", async () => {
    registerCertificatePdfFonts(Font);
    const buf = await renderToBuffer(
      createElement(CertificatePdfDocument, samplePayload()) as Parameters<typeof renderToBuffer>[0],
    );
    expect(buf.length).toBeGreaterThan(4_000);
    expect(buf.subarray(0, 4).toString("utf8")).toBe("%PDF");
  });
});
