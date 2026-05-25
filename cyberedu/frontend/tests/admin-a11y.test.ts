import { describe, expect, it } from "vitest";
import {
  auditSeverityPresentation,
  completionLevelLabel,
} from "@/lib/admin-a11y";

describe("admin-a11y", () => {
  it("maps audit severity to readable labels", () => {
    expect(auditSeverityPresentation("danger").label).toBe("Критично");
    expect(auditSeverityPresentation("warn").label).toBe("Предупреждение");
    expect(auditSeverityPresentation("unknown_xyz").label).toBe("unknown_xyz");
  });

  it("completionLevelLabel supplements percent-only cues", () => {
    expect(completionLevelLabel(20)).toBe("низкий");
    expect(completionLevelLabel(55)).toBe("средний");
    expect(completionLevelLabel(80)).toBe("достаточный");
  });
});
