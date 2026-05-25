import { describe, expect, it } from "vitest";
import { isPracticeScenarioReady, PRACTICE_SCENARIO_EMPTY_MESSAGE } from "@/lib/practice-scenario-panel-ui";

describe("isPracticeScenarioReady", () => {
  it("returns false when scenario missing or without goal", () => {
    expect(isPracticeScenarioReady(undefined)).toBe(false);
    expect(isPracticeScenarioReady(null)).toBe(false);
    expect(isPracticeScenarioReady({ context: "ctx", goal: "  " })).toBe(false);
  });

  it("returns true when goal is present", () => {
    expect(
      isPracticeScenarioReady({
        role: "Вы аналитик SOC.",
        context: "Сотрудник переслал письмо.",
        goal: "Найти минимум 3 признака фишинга.",
      }),
    ).toBe(true);
  });
});

describe("PRACTICE_SCENARIO_EMPTY_MESSAGE", () => {
  it("uses graceful placeholder copy", () => {
    expect(PRACTICE_SCENARIO_EMPTY_MESSAGE).toContain("будет добавлен");
  });
});
