import type { LearnerMemorySnapshot, TutorDifficulty, TutorPageContext } from "@/lib/ai/tutor/types";

/**
 * Адаптивная сложность объяснений по прогрессу курса и глубине диалога.
 */
export function resolveTutorDifficulty(
  memory: LearnerMemorySnapshot,
  pageContext: TutorPageContext,
  historyLength: number,
): TutorDifficulty {
  const order = pageContext.moduleOrder ?? 1;
  const ratio =
    memory.totalActiveModules > 0 ? memory.completedModules / memory.totalActiveModules : 0;

  let score = 0;
  if (order <= 2) score += 0;
  else if (order <= 5) score += 1;
  else score += 2;

  if (ratio >= 0.7) score += 1;
  if (historyLength >= 8) score += 1;

  const p = memory.currentModuleProgress;
  if (p?.testDone && p?.practiceDone) score += 1;

  if (score <= 1) return "beginner";
  if (score <= 3) return "intermediate";
  return "advanced";
}

export function temperatureForDifficulty(d: TutorDifficulty): number {
  switch (d) {
    case "beginner":
      return 0.45;
    case "intermediate":
      return 0.55;
    case "advanced":
      return 0.6;
  }
}
