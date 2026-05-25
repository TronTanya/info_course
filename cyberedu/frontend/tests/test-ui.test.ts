import { describe, expect, it } from "vitest";
import { computeTestMaxScore, countQuestionsByType, formatPassingScore, formatRemainingQuestions } from "@/lib/test-ui";

describe("test-ui", () => {
  it("computeTestMaxScore skips manual text questions", () => {
    expect(
      computeTestMaxScore([
        { points: 10, manualTextGrading: false },
        { points: 5, manualTextGrading: true },
      ]),
    ).toBe(10);
  });

  it("formatPassingScore shows points and percent", () => {
    expect(formatPassingScore(70, 100)).toBe("70 из 100 б. (70%)");
  });

  it("countQuestionsByType groups by type", () => {
    const rows = countQuestionsByType([
      { questionType: "SINGLE_CHOICE" },
      { questionType: "SINGLE_CHOICE" },
      { questionType: "TEXT" },
    ]);
    expect(rows.find((r) => r.type === "SINGLE_CHOICE")?.count).toBe(2);
    expect(rows.find((r) => r.type === "TEXT")?.count).toBe(1);
  });

  it("formatRemainingQuestions pluralizes in Russian", () => {
    expect(formatRemainingQuestions(3, 5)).toMatch(/Осталось 2 вопроса/);
    expect(formatRemainingQuestions(5, 5)).toBe("Все вопросы заполнены");
  });
});
