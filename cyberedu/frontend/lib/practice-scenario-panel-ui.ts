import type { PracticeScenario } from "@/types/practice-view-model";

export const PRACTICE_SCENARIO_EMPTY_MESSAGE = "Сценарий лаборатории будет добавлен позже.";

export const PRACTICE_SCENARIO_FIELD_LABELS = {
  role: "Роль",
  context: "Сценарий",
  goal: "Цель",
} as const;

/** Сценарий готов к показу, если есть цель (источник — instruction / task в JSON). */
export function isPracticeScenarioReady(scenario?: PracticeScenario | null): scenario is PracticeScenario {
  return Boolean(scenario?.goal?.trim());
}
