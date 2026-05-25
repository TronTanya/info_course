import { describe, expect, it } from "vitest";
import {
  CERTIFICATE_PUBLIC_NOT_FOUND_COPY,
  sanitizeCertificateUserMessage,
  mapCertificatePdfDownloadError,
} from "@/lib/certificate-ui-states";

describe("certificate-ui-states", () => {
  it("sanitizes infrastructure leaks from user messages", () => {
    expect(sanitizeCertificateUserMessage("Prisma P2002 unique", "fallback")).toBe("fallback");
    expect(sanitizeCertificateUserMessage("stack at /node_modules/x", "fallback")).toBe("fallback");
    expect(sanitizeCertificateUserMessage("a1b2c3d4-e5f6-7890-abcd-ef1234567890", "fallback")).toBe("fallback");
    expect(sanitizeCertificateUserMessage("Номер неверный", "fallback")).toBe("Номер неверный");
  });

  it("maps pdf download status without exposing ids", () => {
    expect(mapCertificatePdfDownloadError(404)).toBe("unauthorized");
    expect(mapCertificatePdfDownloadError(403)).toBe("pdf_download");
    expect(mapCertificatePdfDownloadError(500)).toBe("pdf_download");
  });

  it("public not found copy avoids internal ids", () => {
    expect(CERTIFICATE_PUBLIC_NOT_FOUND_COPY.description).not.toMatch(/uuid|prisma/i);
  });
});
