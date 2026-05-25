import { sanitizeScenarioDataForStudent } from "@/lib/practice-student-scenario";
import {
  assertCleanPracticeViewPayload,
  collectForbiddenPracticeKeys,
} from "@/lib/practice-view-mapper";
import type { PracticePageTask } from "@/lib/practice-page-types";
import { PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS } from "@/types/practice-view-model";

export { PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS };

/** Проверка view + runtime перед сериализацией на клиент (тесты и регрессии). */
export function assertCleanPracticePageTask(task: PracticePageTask): void {
  assertCleanPracticeViewPayload(task.view);
  if (task.runtime.scenarioData != null) {
    const bad = [...collectForbiddenPracticeKeys(task.runtime.scenarioData)];
    if (bad.length > 0) {
      throw new Error(`Forbidden keys in runtime.scenarioData: ${bad.join(", ")}`);
    }
  }
}

export function assertSanitizedScenarioHasNoForbiddenKeys(raw: unknown): void {
  const safe = sanitizeScenarioDataForStudent(raw);
  const bad = [...collectForbiddenPracticeKeys(safe)];
  if (bad.length > 0) {
    throw new Error(`sanitizeScenarioDataForStudent left forbidden keys: ${bad.join(", ")}`);
  }
}
