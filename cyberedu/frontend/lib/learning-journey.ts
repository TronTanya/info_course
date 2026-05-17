import { findFocusModule } from "@/lib/dashboard-ui";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow, UserCourseProgressResult } from "@/lib/progress";

export type LearningJourneyStepId =
  | "register"
  | "course"
  | "lesson"
  | "test"
  | "practice"
  | "certificate";

const ORDER: LearningJourneyStepId[] = [
  "register",
  "course",
  "lesson",
  "test",
  "practice",
  "certificate",
];

export function journeyStepIndex(step: LearningJourneyStepId): number {
  return ORDER.indexOf(step);
}

/** Текущий шаг пути обучения для дашборда и карты курса. */
export function inferLearningJourneyStep(
  stats: ProfileCourseStats | null,
  modules: CourseProgressModuleRow[],
): LearningJourneyStepId {
  if (!stats) return "register";
  if (stats.allModulesComplete) return "certificate";

  const row =
    modules.find((m) => m.module.id === stats.currentModuleId) ??
    modules.find((m) => m.unlocked && !m.moduleCompleted);

  if (!row) return "course";

  return stepFromModuleRow(row);
}

function stepFromModuleRow(row: CourseProgressModuleRow): LearningJourneyStepId {
  const p = row.progress;
  const req = row.requirements;
  if (req.practiceRequired && !p?.practiceCompleted) {
    if (p?.testCompleted || !req.testRequired) return "practice";
  }
  if (req.testRequired && !p?.testCompleted) {
    if (p?.lessonCompleted || !req.lessonRequired) return "test";
  }
  if (req.lessonRequired && !p?.lessonCompleted) return "lesson";
  return "course";
}

/** Текущий шаг для карты курса (без ProfileCourseStats). */
export function inferLearningJourneyFromCourse(data: UserCourseProgressResult): LearningJourneyStepId {
  const { modules } = data;
  if (modules.length > 0 && modules.every((m) => m.moduleCompleted)) return "certificate";
  const focus = findFocusModule(modules);
  if (!focus) return "course";
  return stepFromModuleRow(focus);
}
