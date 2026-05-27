"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavPrimary, adminNavSecondary } from "@/lib/design-system/nav-config";
import { isAdminPrimaryActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

/** Glass tile grid for admin on mobile (< lg). */
export function AdminMobileNav() {
  const pathname = usePathname() ?? "";

  const renderTile = (item: (typeof adminNavPrimary)[number]) => {
    const active = isAdminPrimaryActive(pathname, item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn("ce-admin-mobile-tile", active && "ce-admin-mobile-tile--active")}
        aria-current={active ? "page" : undefined}
      >
        <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="space-y-3 pb-2 lg:hidden">
      <nav className="ce-admin-mobile-grid" aria-label="Разделы админки">
        {adminNavPrimary.map(renderTile)}
      </nav>
      {adminNavSecondary.length > 0 ? (
        <nav className="ce-admin-mobile-grid" aria-label="Дополнительные разделы">
          {adminNavSecondary.map(renderTile)}
        </nav>
      ) : null}
    </div>
  );
}
