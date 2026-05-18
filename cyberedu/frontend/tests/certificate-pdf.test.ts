import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { CertificatePdfDocument, type CertificatePdfPayload } from "@/lib/certificate-pdf";

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
  it("renders PDF buffer with Cyrillic (WOFF fonts, not WOFF2)", async () => {
    const buf = await renderToBuffer(
      createElement(CertificatePdfDocument, samplePayload()) as Parameters<typeof renderToBuffer>[0],
    );
    expect(buf.length).toBeGreaterThan(4_000);
    expect(buf.subarray(0, 4).toString("utf8")).toBe("%PDF");
  });
});
