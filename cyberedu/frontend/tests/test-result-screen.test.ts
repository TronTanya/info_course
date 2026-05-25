import { describe, expect, it } from "vitest";
import { formatTestResultAttemptInfo } from "@/lib/test-flow";
import { buildTestResultViewModel, collectForbiddenKeys } from "@/lib/test-view-mapper";

describe("TestResultScreen data", () => {
  it("formatTestResultAttemptInfo shows attempt line", () => {
    expect(formatTestResultAttemptInfo(2, 5)).toMatch(/Попытка 2 из 5/);
    expect(formatTestResultAttemptInfo(1, null)).toBe("Попытка 1");
  });

  it("view model excludes answer keys and unsafe explanations", () => {
    const model = buildTestResultViewModel({
      attemptId: "a1",
      score: 4,
      maxScore: 10,
      percentage: 40,
      passed: false,
      correctCount: 1,
      totalCount: 2,
      moduleId: "m1",
      review: [
        {
          questionId: "q1",
          questionText: "Фишинг в почте",
          explanation: "Правильный ответ — вариант B",
          isCorrect: false,
        },
        {
          questionId: "q2",
          questionText: "MFA",
          topic: "MFA",
          feedback: "Двухфакторная аутентификация усиливает защиту.",
          explanation: "Двухфакторная аутентификация усиливает защиту.",
          isCorrect: true,
        },
      ],
    });

    expect(model.passed).toBe(false);
    expect(model.weakTopics[0]?.reason).toBeUndefined();
    expect(model.strongTopics).toHaveLength(1);
    expect(model.canRetry).toBe(true);
    expect(model.recommendations.map((r) => r.title)).toContain("Вернуться к курсу");
    expect(model.nextStep?.type).toBe("lesson");

    const forbidden = collectForbiddenKeys(model);
    expect(forbidden.size).toBe(0);
    expect(JSON.stringify(model)).not.toMatch(/correctOption|answerKey/i);
  });

  it("passed result next step points to practice", () => {
    const model = buildTestResultViewModel({
      attemptId: "a2",
      score: 8,
      maxScore: 10,
      percentage: 80,
      passed: true,
      totalCount: 3,
      moduleId: "m1",
      review: [],
    });
    expect(model.nextStep?.type).toBe("practice");
    expect(model.canRetry).toBe(true);
    expect(model.recommendations.some((r) => r.title === "Вернуться к курсу")).toBe(true);
  });

  it("exhausted attempts set canRetry false", () => {
    const model = buildTestResultViewModel({
      attemptId: "a3",
      score: 2,
      maxScore: 10,
      percentage: 20,
      passed: false,
      totalCount: 2,
      moduleId: "m1",
      attemptsUsed: 3,
      attemptLimit: 3,
      review: [],
    });
    expect(model.canRetry).toBe(false);
  });
});
