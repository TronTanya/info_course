/** Страница отказа в доступе (без раскрытия деталей RBAC). */
export const ADMIN_ACCESS_DENIED_PATH = "/admin/access-denied" as const;

/** Пути админки без проверки роли ADMIN (только gate / отказ). */
export const ADMIN_ACCESS_PUBLIC_PATHS = [ADMIN_ACCESS_DENIED_PATH] as const;

export function isAdminAccessPublicPath(pathname: string): boolean {
  return ADMIN_ACCESS_PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
