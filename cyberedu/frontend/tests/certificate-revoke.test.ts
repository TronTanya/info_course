import { describe, expect, it } from "vitest";
import {
  REVOKE_REASON_MAX_LENGTH,
  certificateSupportsRevoke,
  certificateSupportsRevokeReason,
  normalizeRevokeReason,
} from "@/lib/certificate-registry";

describe("certificate revoke support", () => {
  it("backend revoke is enabled (revokedAt migration)", () => {
    expect(certificateSupportsRevoke()).toBe(true);
    expect(certificateSupportsRevokeReason()).toBe(true);
  });

  it("normalizes optional revoke reason for audit", () => {
    expect(normalizeRevokeReason("  ошибочная выдача  ")).toBe("ошибочная выдача");
    expect(normalizeRevokeReason("")).toBeUndefined();
    expect(normalizeRevokeReason(null)).toBeUndefined();
    const long = "x".repeat(REVOKE_REASON_MAX_LENGTH + 20);
    expect(normalizeRevokeReason(long)?.length).toBe(REVOKE_REASON_MAX_LENGTH);
  });
});
