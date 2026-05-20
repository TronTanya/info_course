const ADMIN_CONTENT_PREFIXES = [
  "/admin/modules",
  "/admin/lessons",
  "/admin/tests",
  "/admin/practical-tasks",
] as const;

/** Активный пункт меню: точное совпадение или вложенный путь; `/admin` — только корень админки. */
export function isNavHrefActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/admin") return pathname === "/admin" || pathname === "/admin/";
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/";
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

/** Разделы управления контентом (модули, лекции, тесты, практики). */
export function isAdminContentActive(pathname: string): boolean {
  return ADMIN_CONTENT_PREFIXES.some((prefix) => isNavHrefActive(pathname, prefix));
}

export function isAdminPrimaryActive(pathname: string, href: string): boolean {
  if (href === "/admin/modules") return isAdminContentActive(pathname);
  return isNavHrefActive(pathname, href);
}
