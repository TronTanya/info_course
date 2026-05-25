import { describe, expect, it } from "vitest";
import {
  buildTestAnsweredFlags,
  countTestAnswered,
  emptyTestLocalAnswers,
  formatTestTimerDisplay,
  isTestQuestionFilled,
  testDraftStorageKey,
  testTimeLimitSeconds,
} from "@/lib/test-taking";
import type { ClientTestQuestion } from "@/lib/test-grading";

const qSingle: ClientTestQuestion = {
  id: "q1",
  questionText: "Q1",
  questionType: "SINGLE_CHOICE",
  points: 1,
  orderNumber: 1,
  answers: [
    { id: "a1", answerText: "A" },
    { id: "a2", answerText: "B" },
  ],
};

describe("test-taking", () => {
  it("emptyTestLocalAnswers and isTestQuestionFilled", () => {
    const local = emptyTestLocalAnswers([qSingle]);
    expect(isTestQuestionFilled(qSingle, local)).toBe(false);
    local.single[qSingle.id] = "a1";
    expect(isTestQuestionFilled(qSingle, local)).toBe(true);
    expect(countTestAnswered([qSingle], local)).toBe(1);
    expect(buildTestAnsweredFlags([qSingle], local)).toEqual([true]);
  });

  it("testDraftStorageKey is scoped per module and test", () => {
    expect(testDraftStorageKey("m1", "t1")).toBe("ce-test-draft:m1:t1");
  });

  it("formatTestTimerDisplay", () => {
    expect(formatTestTimerDisplay(125)).toBe("02:05");
    expect(formatTestTimerDisplay(0)).toBe("00:00");
  });

  it("testTimeLimitSeconds", () => {
    expect(testTimeLimitSeconds(null)).toBeNull();
    expect(testTimeLimitSeconds(15)).toBe(900);
  });
});
