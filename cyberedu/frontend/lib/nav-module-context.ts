import { findFocusModule } from "@/lib/dashboard-ui";
import { persistLastModuleId } from "@/lib/nav-resolve";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

/** Модуль для ссылок «Уроки / Тесты / Практика» по прогрессу курса. */
export function pickModuleIdForStudentNav(
  stats: ProfileCourseStats | null,
  modules: CourseProgressModuleRow[],
): string | null {
  if (stats?.currentModuleId) return stats.currentModuleId;
  const focus = findFocusModule(modules);
  if (focus) return focus.module.id;
  const unlocked = modules.find((m) => m.unlocked);
  if (unlocked) return unlocked.module.id;
  return modules[modules.length - 1]?.module.id ?? null;
}

/** Сохраняет модуль в sessionStorage для бокового меню. */
export function syncStudentNavModule(
  stats: ProfileCourseStats | null,
  modules: CourseProgressModuleRow[],
): string | null {
  const id = pickModuleIdForStudentNav(stats, modules);
  if (id) persistLastModuleId(id);
  return id;
}
