import { describe, expect, it } from "vitest";
import { buildTestResultInsights, topicLabelFromQuestion } from "@/lib/test-result-insights";

describe("test-result-insights", () => {
  it("topicLabelFromQuestion truncates long text", () => {
    const long = "А".repeat(100);
    const label = topicLabelFromQuestion(long, 40);
    expect(label.length).toBeLessThanOrEqual(41);
    expect(label.endsWith("…")).toBe(true);
  });

  it("buildTestResultInsights splits strengths and review without answer keys", () => {
    const insights = buildTestResultInsights([
      {
        questionId: "q1",
        questionText: "Что такое фишинг?",
        explanation: "Подсказка",
        isCorrect: true,
        pointsEarned: 1,
        maxPoints: 1,
      },
      {
        questionId: "q2",
        questionText: "Как проверить URL?",
        explanation: null,
        isCorrect: false,
        pointsEarned: 0,
        maxPoints: 1,
      },
      {
        questionId: "q3",
        questionText: "Опишите инцидент",
        explanation: null,
        isCorrect: null,
        pointsEarned: 0,
        maxPoints: 2,
      },
    ]);

    expect(insights.strengths).toHaveLength(1);
    expect(insights.toReview).toHaveLength(1);
    expect(insights.pendingCount).toBe(1);
    expect(insights.strengths[0]?.topicLabel).toContain("фишинг");
    const serialized = JSON.stringify(insights);
    expect(serialized).not.toMatch(/correctAnswer/i);
  });
});
