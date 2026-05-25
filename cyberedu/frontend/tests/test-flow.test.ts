import { describe, expect, it } from "vitest";
import { buildTestIntroDescription, formatTestAttemptHistory, TEST_INTRO_CTA } from "@/lib/test-flow";
import { isSafeTestExplanation, safeTestExplanation } from "@/lib/test-explanation-safety";

describe("test-flow", () => {
  it("uses Начать тест CTA label", () => {
    expect(TEST_INTRO_CTA).toBe("Начать тест");
  });

  it("builds intro description from module text", () => {
    const d = buildTestIntroDescription({
      moduleTitle: "Фишинг",
      moduleDescription: "Учим распознавать подозрительные письма.",
      questionCount: 10,
    });
    expect(d).toContain("подозрительные");
    expect(d).not.toContain(":::");
  });

  it("formats attempt history in Russian", () => {
    expect(formatTestAttemptHistory(0)).toBeNull();
    expect(formatTestAttemptHistory(1)).toContain("1 попытка");
    expect(formatTestAttemptHistory(3)).toContain("3 попытки");
  });
});

describe("test-explanation-safety", () => {
  it("rejects explanations that leak correct answer wording", () => {
    expect(isSafeTestExplanation("Правильный ответ — вариант B")).toBe(false);
    expect(safeTestExplanation("Правильный ответ — вариант B")).toBeNull();
  });

  it("allows educational explanations", () => {
    const t = "Проверьте заголовок From и домен отправителя.";
    expect(safeTestExplanation(t)).toBe(t);
  });

  it("rejects answer key and solution phrasing", () => {
    expect(isSafeTestExplanation("Ключ ответа: вариант C")).toBe(false);
    expect(isSafeTestExplanation("Текст решения см. ниже")).toBe(false);
  });
});
