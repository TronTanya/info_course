import { describe, expect, it } from "vitest";
import {
  logSeverityPresentation,
  logSeverityToneClass,
  minLengthCounterStatus,
  practiceLabTitleId,
  practicePageHeadingLabel,
  practiceSubmitDisabledReasonId,
  PRACTICE_FORM_VALIDATION_ERROR_ID,
  resolvePracticeLabTitleLevel,
} from "@/lib/practice-a11y";

describe("practice-a11y", () => {
  it("exposes stable ids", () => {
    expect(PRACTICE_FORM_VALIDATION_ERROR_ID).toBe("practice-form-validation-error");
    expect(practiceLabTitleId("t1")).toBe("practice-lab-title-t1");
    expect(practiceSubmitDisabledReasonId("t1")).toBe("practice-submit-disabled-t1");
  });

  it("resolves one h1 per page", () => {
    expect(resolvePracticeLabTitleLevel(0, 1)).toBe(1);
    expect(resolvePracticeLabTitleLevel(0, 3)).toBe(2);
    expect(resolvePracticeLabTitleLevel(2, 3)).toBe(2);
  });

  it("builds page heading for multi-task labs", () => {
    expect(practicePageHeadingLabel("Модуль 2")).toContain("Кибер-лаборатория");
    expect(practicePageHeadingLabel("Модуль 2")).toContain("Модуль 2");
  });

  it("min length counter is not color-only", () => {
    expect(minLengthCounterStatus(5, 10).sufficient).toBe(false);
    expect(minLengthCounterStatus(5, 10).spokenLabel).toMatch(/нужно ещё/);
    expect(minLengthCounterStatus(12, 10).sufficient).toBe(true);
    expect(minLengthCounterStatus(12, 10).spokenLabel).toMatch(/достаточно/);
  });

  it("log severity includes textual level", () => {
    expect(logSeverityPresentation("ERROR").display).toMatch(/Критичность/);
    expect(logSeverityPresentation("WARN").display).toMatch(/Предупреждение/);
    expect(logSeverityPresentation("INFO").display).toMatch(/Информация/);
    expect(logSeverityToneClass("danger")).toContain("text-danger");
  });
});
