import type { CourseProgressModuleRow } from "@/lib/progress";

const SAFE_MODULE_ID = /^[a-zA-Z0-9_-]+$/;

/** Безопасный deep-link: только разблокированные модули; иначе — карта курса. */
export function dashboardHrefForModuleRow(
  row: CourseProgressModuleRow | null | undefined,
  segment?: "lesson" | "test" | "practice",
): string {
  if (!row?.unlocked || !SAFE_MODULE_ID.test(row.module.id)) {
    return "/dashboard/course";
  }
  const base = `/dashboard/course/${row.module.id}`;
  return segment ? `${base}/${segment}` : base;
}

export function dashboardHrefByModuleId(
  modules: CourseProgressModuleRow[],
  moduleId: string | null | undefined,
  segment?: "lesson" | "test" | "practice",
): string {
  if (!moduleId || !SAFE_MODULE_ID.test(moduleId)) {
    return "/dashboard/course";
  }
  const row = modules.find((m) => m.module.id === moduleId);
  return dashboardHrefForModuleRow(row, segment);
}

export function findModuleRowByTitle(
  modules: CourseProgressModuleRow[],
  moduleTitle: string,
): CourseProgressModuleRow | null {
  return modules.find((m) => m.module.title === moduleTitle) ?? null;
}
