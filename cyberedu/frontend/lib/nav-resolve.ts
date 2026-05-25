import { isNavHrefActive } from "@/lib/nav-active";
import { DASHBOARD_MENTOR_PAGE_PATH } from "@/lib/dashboard-ai-widget";

/** Ключ sessionStorage: последний модуль курса для ссылок «Уроки / Тесты / Практика». */
export const CE_LAST_MODULE_STORAGE_KEY = "ce-last-course-module-id";

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

export function extractModuleIdFromPath(pathname: string): string | null {
  return pathname.match(/^\/dashboard\/course\/([^/]+)/)?.[1] ?? null;
}

export function readLastModuleIdFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const id = sessionStorage.getItem(CE_LAST_MODULE_STORAGE_KEY)?.trim();
    return id || null;
  } catch {
    return null;
  }
}

export const NAV_MODULE_CHANGED_EVENT = "cyberedu:nav-module-changed";

export function persistLastModuleId(moduleId: string): void {
  if (typeof window === "undefined" || !moduleId.trim()) return;
  const id = moduleId.trim();
  try {
    sessionStorage.setItem(CE_LAST_MODULE_STORAGE_KEY, id);
    window.dispatchEvent(new CustomEvent(NAV_MODULE_CHANGED_EVENT, { detail: { moduleId: id } }));
  } catch {
    /* ignore quota / private mode */
  }
}

function resolveModuleIdForNav(pathname: string, lastModuleId?: string | null): string | null {
  return extractModuleIdFromPath(pathname) ?? lastModuleId ?? null;
}

/** Контекстные ссылки: урок/тест/практика привязаны к модулю из URL или последнему посещённому. */
export function resolveStudentNavPaths(
  pathname: string,
  options?: { lastModuleId?: string | null },
): StudentNavPaths {
  const moduleId = resolveModuleIdForNav(pathname, options?.lastModuleId);
  const lessonHref = moduleId ? `/dashboard/course/${moduleId}/lesson` : "/dashboard/course";
  const testHref = moduleId ? `/dashboard/course/${moduleId}/test` : "/dashboard/course";
  const practiceHref = moduleId
    ? `/dashboard/course/${moduleId}/practice`
    : "/dashboard/my-assignments";

  return {
    dashboard: "/dashboard",
    course: "/dashboard/course",
    lessons: lessonHref,
    tests: testHref,
    practice: practiceHref,
    mentor: DASHBOARD_MENTOR_PAGE_PATH,
    profile: "/dashboard/profile",
  };
}

export function syncLastModuleIdFromPathname(pathname: string): string | null {
  const fromPath = extractModuleIdFromPath(pathname);
  if (fromPath) {
    persistLastModuleId(fromPath);
    return fromPath;
  }
  return readLastModuleIdFromStorage();
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
      return (
        pathname === DASHBOARD_MENTOR_PAGE_PATH ||
        pathname.startsWith(`${DASHBOARD_MENTOR_PAGE_PATH}/`) ||
        pathname === "/mentor" ||
        pathname.startsWith("/mentor/")
      );
    case "profile":
      return isNavHrefActive(pathname, "/dashboard/profile");
    default:
      return false;
  }
}
