import { ACHIEVEMENT_CATALOG, type AchievementRow } from "@/lib/achievements";
import { computeStepMetrics } from "@/lib/dashboard-ui";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

export const ACHIEVEMENTS_PANEL_EMPTY = {
  title: "Достижения появятся по мере прохождения курса.",
  description: "Пройдите лекцию, сдайте тест или отправьте практику — бейджи откроются автоматически.",
} as const;

export type AchievementPanelProgress = {
  label: string;
  value: number;
  max: number;
};

export type AchievementsPanelView = {
  unlocked: AchievementRow[];
  next: AchievementRow | null;
  unlockedCount: number;
  totalCount: number;
  catalogPercent: number;
  /** Прогресс к ближайшему бейджу — только из фактов прогресса, без «как будто открыто». */
  nextProgress: AchievementPanelProgress | null;
  catalogEmpty: boolean;
};

/**
 * Оценка прогресса к конкретному закрытому бейджу (не засчитывает unlock).
 * Для сценарных бейджей (фишинг, пароли) — null, пока нет факта в stats.
 */
export function deriveProgressToAchievement(
  target: AchievementRow,
  stats: ProfileCourseStats | null,
  modules: CourseProgressModuleRow[],
): AchievementPanelProgress | null {
  if (target.unlocked || !stats) return null;

  const steps = computeStepMetrics(modules);

  switch (target.kind) {
    case "LESSON_STUDIED":
      if (steps.lessonsTotal <= 0) return null;
      return { label: "Лекции изучены", value: steps.lessonsDone, max: steps.lessonsTotal };

    case "TEST_PASSED":
      if (steps.testsTotal <= 0) return null;
      return { label: "Тесты зачтены", value: steps.testsDone, max: steps.testsTotal };

    case "PRACTICE_SUBMITTED":
      if (steps.practiceTotal <= 0) return null;
      return { label: "Практики сданы", value: steps.practiceDone, max: steps.practiceTotal };

    case "FIRST_MODULE_COMPLETE":
      return stats.completedModules >= 1
        ? null
        : { label: "Модули завершены", value: 0, max: 1 };

    case "TWO_MODULES_COMPLETE":
      return { label: "Модули завершены", value: stats.completedModules, max: 2 };

    case "THREE_MODULES_COMPLETE":
      return { label: "Модули завершены", value: stats.completedModules, max: 3 };

    case "COURSE_HALF_COMPLETE": {
      const half = Math.max(1, Math.ceil(stats.totalModules / 2));
      return { label: "Модули программы", value: stats.completedModules, max: half };
    }

    case "ONE_MODULE_REMAINING": {
      if (stats.totalModules <= 1) return null;
      const targetDone = stats.totalModules - 1;
      return { label: "Модули до финиша", value: stats.completedModules, max: targetDone };
    }

    case "CERTIFICATE_EARNED":
      if (stats.totalModules <= 0) return null;
      return { label: "Модули программы", value: stats.completedModules, max: stats.totalModules };

    case "ALL_LESSONS_STUDIED":
      if (steps.lessonsTotal <= 0) return null;
      return { label: "Лекции по курсу", value: steps.lessonsDone, max: steps.lessonsTotal };

    default:
      return null;
  }
}

export function buildAchievementsPanelView(
  rows: AchievementRow[],
  stats: ProfileCourseStats | null = null,
  modules: CourseProgressModuleRow[] = [],
): AchievementsPanelView {
  const catalog = rows.length > 0 ? rows : [];
  const unlocked = catalog.filter((r) => r.unlocked);
  const next = catalog.find((r) => !r.unlocked) ?? null;
  const totalCount = catalog.length > 0 ? catalog.length : ACHIEVEMENT_CATALOG.length;
  const unlockedCount = unlocked.length;
  const catalogPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const nextProgress = next ? deriveProgressToAchievement(next, stats, modules) : null;

  return {
    unlocked,
    next,
    unlockedCount,
    totalCount,
    catalogPercent,
    nextProgress,
    catalogEmpty: catalog.length === 0,
  };
}
