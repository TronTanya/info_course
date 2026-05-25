/** Урок / тест / практика — без обязательного слэша после сегмента (…/lesson). */
export function isImmersiveDashboardPath(pathname: string): boolean {
  return /\/(?:lesson|practice|test)(?:\/|$)/.test(pathname);
}

export function isLessonDashboardPath(pathname: string): boolean {
  return /\/lesson(?:\/|$)/.test(pathname);
}
