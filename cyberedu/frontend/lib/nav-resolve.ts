import { isNavHrefActive } from "@/lib/nav-active";
import {
  extractModuleIdFromPath,
  resolveStudentNavModuleId,
} from "@/lib/student-nav-module-id";

export { extractModuleIdFromPath } from "@/lib/student-nav-module-id";

/** Ключи быстрой навигации студента (фиксированные маршруты не ломаем). */
export type StudentQuickNavKey =
  | "dashboard"
  | "course"
  | "lessons"
  | "tests"
  | "practice"
  | "mentor"
  | "profile";

export type StudentNavPaths = Record<StudentQuickNavKey, string>;

/** Контекстные ссылки: урок/тест/практика привязаны к модулю в URL или к последнему открытому модулю. */
export function resolveStudentNavPaths(
  pathname: string,
  moduleIdOverride?: string | null,
): StudentNavPaths {
  const moduleId = resolveStudentNavModuleId(pathname, moduleIdOverride);
  const lessonHref = moduleId
    ? `/dashboard/course/${moduleId}/lesson`
    : "/dashboard/continue/lesson";
  const testHref = moduleId ? `/dashboard/course/${moduleId}/test` : "/dashboard/continue/test";
  const practiceHref = moduleId
    ? `/dashboard/course/${moduleId}/practice`
    : "/dashboard/my-assignments";

  return {
    dashboard: "/dashboard",
    course: "/dashboard/course",
    lessons: lessonHref,
    tests: testHref,
    practice: practiceHref,
    mentor: lessonHref,
    profile: "/dashboard/profile",
  };
}

export function isStudentQuickNavActive(pathname: string, key: StudentQuickNavKey): boolean {
  switch (key) {
    case "dashboard":
      return pathname === "/dashboard" || pathname === "/dashboard/";
    case "course":
      if (!pathname.startsWith("/dashboard/course")) return false;
      return !/\/(lesson|test|practice)(\/|$)/.test(pathname);
    case "lessons":
      return /\/lesson(?:\/|$)/.test(pathname);
    case "tests":
      return /\/test(?:\/|$)/.test(pathname);
    case "practice":
      return /\/practice(?:\/|$)/.test(pathname) || pathname.startsWith("/dashboard/my-assignments");
    case "mentor":
      return /\/lesson(?:\/|$)/.test(pathname);
    case "profile":
      return isNavHrefActive(pathname, "/dashboard/profile");
    default:
      return false;
  }
}
