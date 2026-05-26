"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavPrimary } from "@/lib/design-system/nav-config";
import { isAdminPrimaryActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

/** Glass tile grid for admin on mobile (< lg). */
export function AdminMobileNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="ce-admin-mobile-grid pb-2 lg:hidden" aria-label="Разделы админки">
      {adminNavPrimary.map((item) => {
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
      })}
    </nav>
  );
}
