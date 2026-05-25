import { describe, expect, it } from "vitest";
import {
  buildSafeQuestionFeedbackList,
  hasSafePerQuestionFeedback,
  resolveServerQuestionFeedback,
  toSafeQuestionFeedbackItem,
} from "@/lib/test-question-feedback";

describe("test-question-feedback", () => {
  it("includes items with safe feedback and server topic", () => {
    const items = buildSafeQuestionFeedbackList([
      {
        questionId: "q1",
        questionText: "Как распознать фишинг в почте?",
        topic: "фишинг",
        feedback: "Повторите признаки поддельного отправителя и домена.",
        isCorrect: false,
        showGradingStatus: true,
        pointsEarned: 0,
        maxPoints: 1,
      },
      {
        questionId: "q2",
        questionText: "MFA",
        explanation: "Правильный ответ — вариант B",
        isCorrect: false,
        showGradingStatus: true,
        pointsEarned: 0,
        maxPoints: 1,
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]?.topic).toBe("фишинг");
    expect(items[0]?.feedback).toContain("поддельного");
    expect(items[0]?.gradingStatus).toBe("not_credited");
  });

  it("hasSafePerQuestionFeedback is false without server-safe content", () => {
    expect(
      hasSafePerQuestionFeedback([
        {
          questionId: "q1",
          questionText: "Вопрос",
          explanation: "Правильный ответ — A",
          isCorrect: false,
          showGradingStatus: true,
          pointsEarned: 0,
          maxPoints: 1,
        },
      ]),
    ).toBe(false);
  });

  it("allows topic-only row with grading status", () => {
    const item = toSafeQuestionFeedbackItem(
      {
        questionId: "q1",
        questionText: "Скрытый текст вопроса",
        topic: "MFA",
        feedback: null,
        isCorrect: true,
        showGradingStatus: true,
        pointsEarned: 1,
        maxPoints: 1,
      },
      0,
    );
    expect(item?.topic).toBe("MFA");
    expect(item?.feedback).toBeNull();
    expect(item?.gradingStatus).toBe("credited");
    expect(item?.topic).not.toContain("Скрытый");
  });

  it("does not synthesize feedback from isCorrect on client", () => {
    expect(
      resolveServerQuestionFeedback({
        questionId: "q1",
        questionText: "Q",
        isCorrect: false,
        explanation: null,
      }),
    ).toBeNull();
  });
});
