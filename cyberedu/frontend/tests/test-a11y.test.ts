import { describe, expect, it } from "vitest";
import {
  formatTestSubmitResultAnnouncement,
  testAnswerOptionsLegend,
} from "@/lib/test-a11y";
import { buildTestSubmitSummary, TEST_SUBMIT_ALL_REQUIRED_HINT } from "@/lib/test-submit-confirmation";
import { buildQuestionNavigatorAriaLabel } from "@/lib/test-question-navigator";

describe("test a11y helpers", () => {
  it("formatTestSubmitResultAnnouncement describes pass and fail", () => {
    expect(formatTestSubmitResultAnnouncement(true, 80, 16, 20)).toContain("Тест пройден");
    expect(formatTestSubmitResultAnnouncement(true, 80, 16, 20)).toContain("80");
    expect(formatTestSubmitResultAnnouncement(false, 40, 8, 20)).toContain("не пройден");
    expect(formatTestSubmitResultAnnouncement(false, 40, 8, 20)).toContain("Повторите");
  });

  it("testAnswerOptionsLegend includes question index", () => {
    expect(testAnswerOptionsLegend(2, 10)).toBe("Варианты ответа, вопрос 2 из 10");
  });

  it("buildTestSubmitSummary exposes blockReason when not all answered", () => {
    const s = buildTestSubmitSummary(5, 3, [2, 4]);
    expect(s.canSubmit).toBe(false);
    expect(s.blockReason).toBe(TEST_SUBMIT_ALL_REQUIRED_HINT);
  });

  it("navigator aria labels include status words not only color", () => {
    expect(buildQuestionNavigatorAriaLabel(3, "answered")).toContain("отвечен");
    expect(buildQuestionNavigatorAriaLabel(3, "opened")).toContain("без ответа");
    expect(buildQuestionNavigatorAriaLabel(3, "current")).toContain("на экране");
  });
});
