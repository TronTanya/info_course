/** Активный пункт меню: точное совпадение или вложенный путь; `/admin` — только корень админки. */
export function isNavHrefActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/admin") return pathname === "/admin" || pathname === "/admin/";
  if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/dashboard/";
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}
