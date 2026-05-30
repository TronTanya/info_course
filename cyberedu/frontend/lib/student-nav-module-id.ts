const STORAGE_KEY = "ce-last-module-id";

/** ID модуля из URL курса (`/dashboard/course/:moduleId/...`). */
export function extractModuleIdFromPath(pathname: string): string | null {
  return pathname.match(/^\/dashboard\/course\/([^/]+)/)?.[1] ?? null;
}

export function readLastModuleId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

export function writeLastModuleId(moduleId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, moduleId);
  } catch {
    /* ignore quota / private mode */
  }
}

/** Модуль из URL или последний открытый в кабинете. */
export function resolveStudentNavModuleId(pathname: string, storedModuleId?: string | null): string | null {
  return extractModuleIdFromPath(pathname) ?? storedModuleId ?? null;
}
