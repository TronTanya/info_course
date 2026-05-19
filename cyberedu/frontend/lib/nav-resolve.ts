import { isNavHrefActive } from "@/lib/nav-active";

/** Ключи быстрой навигации студента (фиксированные маршруты не ломаем). */
export type StudentQuickNavKey = "dashboard" | "course" | "tests" | "practice" | "mentor" | "profile";

export type StudentNavPaths = Record<StudentQuickNavKey, string>;

export function extractModuleIdFromPath(pathname: string): string | null {
  return pathname.match(/^\/dashboard\/course\/([^/]+)/)?.[1] ?? null;
}

/** Контекстные ссылки: тест/практика/наставник привязаны к текущему модулю в URL. */
export function resolveStudentNavPaths(pathname: string): StudentNavPaths {
  const moduleId = extractModuleIdFromPath(pathname);
  return {
    dashboard: "/dashboard",
    course: "/dashboard/course",
    tests: moduleId ? `/dashboard/course/${moduleId}/test` : "/dashboard/course",
    practice: moduleId ? `/dashboard/course/${moduleId}/practice` : "/dashboard/my-assignments",
    mentor: moduleId ? `/dashboard/course/${moduleId}/lesson` : "/dashboard/course",
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
