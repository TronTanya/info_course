import { describe, expect, it } from "vitest";
import { formatCertificateVerifyUrlForPdf } from "@/lib/certificate-pdf-format";

describe("formatCertificateVerifyUrlForPdf", () => {
  it("formats host and path without query", () => {
    expect(formatCertificateVerifyUrlForPdf("https://learn.example/verify/CE-2026-ABCD1234")).toBe(
      "learn.example/verify/CE-2026-ABCD1234",
    );
  });

  it("truncates very long URLs", () => {
    const long = `https://x.example/verify/CE-2026-${"A".repeat(120)}`;
    const out = formatCertificateVerifyUrlForPdf(long, 40);
    expect(out.length).toBeLessThanOrEqual(40);
    expect(out.endsWith("…")).toBe(true);
  });
});
