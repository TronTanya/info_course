import { describe, expect, it } from "vitest";
import {
  buildSafeRubricPreviewItems,
  DEFAULT_SAFE_RUBRIC_CRITERIA,
  extractPublicRubricFromScenario,
  isSafeRubricLine,
} from "@/lib/safe-rubric-mapper";
import { buildPracticeViewModel } from "@/lib/practice-view-mapper";
import { PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS } from "@/types/practice-view-model";

describe("isSafeRubricLine", () => {
  it("rejects hidden scoring and answer-key phrasing", () => {
    expect(isSafeRubricLine("Нужно полное совпадение с эталоном по каждой ситуации.")).toBe(false);
    expect(isSafeRubricLine("Проверка по ключевым словам из regex.")).toBe(false);
    expect(isSafeRubricLine("Верный тип инцидента для учебного сценария")).toBe(false);
  });

  it("accepts neutral pedagogical criteria", () => {
    expect(isSafeRubricLine("Полнота анализа учебного сценария")).toBe(true);
    expect(isSafeRubricLine("Безопасные рекомендации для сотрудника")).toBe(true);
  });
});

describe("extractPublicRubricFromScenario", () => {
  it("ignores criteria and gradingRubric, uses only publicRubric", () => {
    const drafts = extractPublicRubricFromScenario({
      criteria: "Совпадение с эталоном по всем ответам.",
      gradingRubric: [{ title: "Скрытый критерий", weight: 10 }],
      publicRubric: [
        "Корректность аргументации",
        { title: "Безопасные рекомендации", description: "Без опасных инструкций." },
        "Нужно полное совпадение с эталоном",
      ],
    });

    expect(drafts).toHaveLength(2);
    expect(drafts[0]?.title).toContain("аргументации");
    expect(drafts[1]?.title).toContain("Безопасные");
    expect(drafts.some((d) => d.title.includes("эталон"))).toBe(false);
  });

  it("returns empty when only hidden rubric fields exist", () => {
    expect(
      extractPublicRubricFromScenario({
        criteria: "Эталон по каждому паролю.",
        hiddenRubric: ["flag-a", "flag-b"],
      }),
    ).toEqual([]);
  });
});

describe("buildSafeRubricPreviewItems", () => {
  it("falls back to default safe criteria when no public rubric", () => {
    const items = buildSafeRubricPreviewItems({
      scenarioData: { criteria: "Эталон и ключевые слова." },
      taskType: "PHISHING_ANALYSIS",
      maxScore: 10,
    });

    expect(items.length).toBe(DEFAULT_SAFE_RUBRIC_CRITERIA.length);
    expect(items[0]?.title).toBe("Полнота анализа");
    expect(items.some((i) => i.title.includes("эталон"))).toBe(false);
    expect(items.every((i) => i.id.startsWith("safe-rubric-"))).toBe(true);
  });

  it("uses public rubric when provided and safe", () => {
    const items = buildSafeRubricPreviewItems({
      scenarioData: {
        publicRubric: [{ title: "Аккуратность оформления ответа", description: "Структура и ясность." }],
      },
      taskType: "TEXT_ANSWER",
      maxScore: 5,
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.title).toContain("оформления");
  });
});

describe("buildPracticeViewModel safeRubric", () => {
  it("does not expose forbidden rubric keys in view model", () => {
    const vm = buildPracticeViewModel({
      task: {
        id: "t1",
        title: "Практика",
        description: "Учебный сценарий.",
        taskType: "LOG_ANALYSIS",
        checkType: "AUTO",
        maxScore: 20,
        minLength: 10,
        instruction: null,
        consoleScenario: null,
        scenarioData: {
          criteria: "Верный тип и ключевые слова.",
          autoKeywords: ["secret"],
        },
        hasInteractiveAutoCheck: false,
        hasStructuredCommandStep: false,
        hasStructuredExplanationStep: false,
      },
      moduleId: "m1",
      moduleTitle: "Модуль",
      moduleOrderNumber: 1,
      practiceGate: { ok: true },
      latestSubmission: null,
    });

    expect(vm.safeRubric.length).toBeGreaterThan(0);
    const blob = JSON.stringify(vm);
    for (const key of PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS) {
      expect(blob).not.toContain(`"${key}"`);
    }
    expect(blob.toLowerCase()).not.toContain("autokeywords");
    expect(blob.toLowerCase()).not.toContain("эталон");
  });
});
