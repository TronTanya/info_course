import { describe, expect, it } from "vitest";

const SENSITIVE_PREFIXES = ["auth.login", "admin.", "certificate.", "ai.safety"] as const;

function isSensitiveAction(action: string): boolean {
  return SENSITIVE_PREFIXES.some((p) => action.startsWith(p));
}

describe("admin-lms-dashboard helpers", () => {
  it("flags sensitive audit actions", () => {
    expect(isSensitiveAction("auth.login.failed")).toBe(true);
    expect(isSensitiveAction("admin.user.role_change")).toBe(true);
    expect(isSensitiveAction("content.publish")).toBe(false);
  });
});
