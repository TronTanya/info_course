import { describe, expect, it } from "vitest";
import {
  certificateVerifyPath,
  normalizePublicCertificateNumber,
  parseCertificateVerifyLookupInput,
} from "@/lib/certificate-verify-url";

describe("certificate-verify-url", () => {
  it("builds public path with certificate number only", () => {
    expect(certificateVerifyPath("CE-2026-ABCD1234")).toBe("/verify/CE-2026-ABCD1234");
  });

  it("parses number from /verify URL", () => {
    expect(normalizePublicCertificateNumber("https://app.example/verify/CE-2026-XY12AB34")).toBe(
      "CE-2026-XY12AB34",
    );
  });

  it("rejects hex verification code as certificate number", () => {
    expect(normalizePublicCertificateNumber("deadbeefdeadbeefdeadbeef")).toBeNull();
  });

  it("lookup prefers certificate number over legacy code", () => {
    const parsed = parseCertificateVerifyLookupInput("CE-2026-TEST1234");
    expect(parsed).toEqual({ kind: "certificateNumber", value: "CE-2026-TEST1234" });
  });

  it("supports legacy verification code lookup input", () => {
    const hex = "a".repeat(36);
    const parsed = parseCertificateVerifyLookupInput(hex);
    expect(parsed?.kind).toBe("legacyVerificationCode");
  });
});
