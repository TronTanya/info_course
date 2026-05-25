import { describe, expect, it } from "vitest";
import {
  buildOpenedFlagsFromVisited,
  buildQuestionNavigatorAriaLabel,
  buildQuestionNavigatorCounts,
  questionNavigatorStatusLabel,
  resolveQuestionNavigatorStatus,
} from "@/lib/test-question-navigator";

describe("test-question-navigator", () => {
  it("resolveQuestionNavigatorStatus prioritizes current over answered", () => {
    const answered = [true, false, false];
    const opened = [true, true, false];
    expect(resolveQuestionNavigatorStatus(0, 0, answered, opened)).toBe("current");
    expect(resolveQuestionNavigatorStatus(1, 0, answered, opened)).toBe("opened");
    expect(resolveQuestionNavigatorStatus(0, 1, answered, opened)).toBe("answered");
    expect(resolveQuestionNavigatorStatus(2, 1, answered, opened)).toBe("not_opened");
  });

  it("buildQuestionNavigatorCounts", () => {
    const counts = buildQuestionNavigatorCounts(
      [true, false, false],
      [true, true, false],
    );
    expect(counts.answered).toBe(1);
    expect(counts.skipped).toBe(2);
    expect(counts.opened).toBe(1);
    expect(counts.notOpened).toBe(1);
  });

  it("buildOpenedFlagsFromVisited marks visited and current", () => {
    expect(buildOpenedFlagsFromVisited(4, 2, [0, 1])).toEqual([true, true, true, false]);
  });

  it("questionNavigatorStatusLabel and aria labels are Russian text", () => {
    expect(questionNavigatorStatusLabel("not_opened")).toBe("не открыт");
    expect(buildQuestionNavigatorAriaLabel(3, "current")).toContain("Вопрос 3");
    expect(buildQuestionNavigatorAriaLabel(3, "current")).toContain("текущий");
    expect(buildQuestionNavigatorAriaLabel(2, "answered")).toContain("отвечен");
  });
});
