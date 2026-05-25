import { describe, expect, it } from "vitest";
import {
  buildSafePracticeHints,
  canUnlockPracticeHintLevel,
  isSafePracticeHintLine,
  normalizePracticeHintsInput,
  PRACTICE_HINTS_EMPTY_MESSAGE,
} from "@/lib/practice-hints";
import { buildPracticeViewModel } from "@/lib/practice-view-mapper";
import { sanitizeAnalyticsProps } from "@/lib/analytics/payload";
import { AnalyticsEvents } from "@/lib/analytics/events";

describe("isSafePracticeHintLine", () => {
  it("rejects hints that leak solutions", () => {
    expect(isSafePracticeHintLine("Нужно полное совпадение с эталоном.")).toBe(false);
    expect(isSafePracticeHintLine("Введите ровно: ping example.com")).toBe(false);
    expect(isSafePracticeHintLine("Правильный ответ — act_refuse")).toBe(false);
  });

  it("accepts neutral guidance", () => {
    expect(isSafePracticeHintLine("Проверьте домен отправителя и срочность формулировок.")).toBe(true);
    expect(isSafePracticeHintLine("Обратите внимание на протокол и опечатки в домене.")).toBe(true);
  });
});

describe("buildSafePracticeHints", () => {
  it("filters unsafe lines and caps at three levels", () => {
    const hints = buildSafePracticeHints({
      hints: [
        "Проверьте домен отправителя.",
        "Эталон: все флаги должны совпасть.",
        "Смотрите на срочность и ссылку.",
        "Четвёртая подсказка не должна попасть.",
      ],
      solution: "hidden",
      answerKey: "all",
    });

    expect(hints).toHaveLength(3);
    expect(hints[0]?.level).toBe(1);
    expect(hints[0]?.title).toBe("Подсказка 1");
    expect(hints[1]?.level).toBe(2);
    expect(hints.map((h) => h.content)).not.toContain("Эталон: все флаги должны совпасть.");
    expect(JSON.stringify(hints)).not.toMatch(/эталон|answerKey|solution/i);
  });
});

describe("canUnlockPracticeHintLevel", () => {
  it("requires previous level to be revealed first", () => {
    const revealed = new Set<number>([0]);
    expect(canUnlockPracticeHintLevel(revealed, 0)).toBe(true);
    expect(canUnlockPracticeHintLevel(revealed, 1)).toBe(true);
    expect(canUnlockPracticeHintLevel(revealed, 2)).toBe(false);

    const afterTwo = new Set([0, 1]);
    expect(canUnlockPracticeHintLevel(afterTwo, 2)).toBe(true);
  });
});

describe("normalizePracticeHintsInput", () => {
  it("prefers view model hints over fallback strings", () => {
    const fromVm = [{ id: "h1", level: 1 as const, title: "Подсказка 1", content: "Из view model." }];
    const out = normalizePracticeHintsInput(fromVm, ["Fallback подсказка для теста."]);
    expect(out).toHaveLength(1);
    expect(out[0]?.content).toContain("view model");
  });

  it("returns empty when nothing safe", () => {
    expect(normalizePracticeHintsInput([], ["эталон по всем ответам"])).toEqual([]);
  });
});

describe("buildPracticeViewModel hints", () => {
  it("maps seed hints without forbidden keys", () => {
    const vm = buildPracticeViewModel({
      task: {
        id: "task-1",
        title: "Разбор фишинга",
        description: "Учебный сценарий.",
        taskType: "PHISHING_ANALYSIS",
        checkType: "AUTO",
        maxScore: 10,
        minLength: 0,
        instruction: null,
        consoleScenario: null,
        scenarioData: {
          hints: ["Проверьте домен отправителя", "Обратите внимание на срочность"],
          correctFlagIds: ["sender"],
        },
        hasInteractiveAutoCheck: false,
        hasStructuredCommandStep: false,
        hasStructuredExplanationStep: false,
      },
      moduleId: "mod-1",
      moduleTitle: "Фишинг",
      moduleOrderNumber: 2,
      practiceGate: { ok: true },
      latestSubmission: null,
    });

    expect(vm.hints).toHaveLength(2);
    expect(vm.hints[0]?.title).toBe("Подсказка 1");
    expect(JSON.stringify(vm.hints)).not.toContain("correctFlagIds");
  });
});

describe("analytics practiceHintOpened", () => {
  it("allows hintLevel without answer content", () => {
    expect(
      sanitizeAnalyticsProps({
        moduleId: "mod_abc12345",
        practiceId: "prac_def67890",
        hintLevel: 2,
        source: "practice_hints",
      }),
    ).toEqual({
      moduleId: "mod_abc12345",
      practiceId: "prac_def67890",
      hintLevel: 2,
      source: "practice_hints",
    });
    expect(AnalyticsEvents.practiceHintOpened).toBe("practice_hint_opened");
  });
});

describe("PRACTICE_HINTS_EMPTY_MESSAGE", () => {
  it("matches ETAP 9 copy", () => {
    expect(PRACTICE_HINTS_EMPTY_MESSAGE).toContain("пока не добавлены");
  });
});
