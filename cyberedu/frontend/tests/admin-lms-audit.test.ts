import { describe, expect, it } from "vitest";
import {
  auditActionLabelRu,
  auditActorLabel,
  isSensitiveAuditAction,
  isSuspiciousAuditEvent,
} from "@/lib/admin-lms-audit";

describe("admin-lms-audit", () => {
  it("flags sensitive audit actions", () => {
    expect(isSensitiveAuditAction("auth.login.failed")).toBe(true);
    expect(isSensitiveAuditAction("admin.user.role_change")).toBe(true);
    expect(isSensitiveAuditAction("content.publish")).toBe(false);
  });

  it("flags suspicious by severity", () => {
    expect(isSuspiciousAuditEvent("lesson.view", "danger")).toBe(true);
    expect(isSuspiciousAuditEvent("lesson.view", "info")).toBe(false);
  });

  it("maps known actions to Russian labels", () => {
    expect(auditActionLabelRu("auth.login.failed")).toBe("Неудачный вход");
    expect(auditActionLabelRu("unknown.action")).toBe("unknown.action");
  });

  it("does not expose actor ids in label helper", () => {
    expect(auditActorLabel(true)).toBe("оператор с правами");
    expect(auditActorLabel(false)).toBe("система");
  });
});
