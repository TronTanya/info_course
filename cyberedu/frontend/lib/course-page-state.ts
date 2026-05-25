import type { CourseProgressModuleRow } from "@/lib/progress";

/** Нет активных модулей в программе. */
export function isCourseWithoutModules(modules: CourseProgressModuleRow[]): boolean {
  return modules.length === 0;
}

/** Пользователь ещё не начал: нет завершённых модулей и нулевой прогресс по всем строкам. */
export function isCourseNotStarted(modules: CourseProgressModuleRow[]): boolean {
  if (modules.length === 0) return false;
  const anyCompleted = modules.some((m) => m.moduleCompleted);
  if (anyCompleted) return false;
  return modules.every((m) => {
    const p = m.progress;
    const started =
      Boolean(p?.lessonCompleted) ||
      Boolean(p?.videoCompleted) ||
      Boolean(p?.testCompleted) ||
      Boolean(p?.practiceCompleted) ||
      m.progressPercent > 0 ||
      m.score > 0;
    return !started;
  });
}
