import { describe, expect, it } from "vitest";
import { isSensitiveAuditAction } from "@/lib/admin-lms-audit";

describe("admin-lms-dashboard helpers", () => {
  it("re-exports sensitive audit detection from admin-lms-audit", () => {
    expect(isSensitiveAuditAction("ai.safety.refusal")).toBe(true);
    expect(isSensitiveAuditAction("content.publish")).toBe(false);
  });
});
