"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavPrimary } from "@/lib/design-system/nav-config";
import { isAdminPrimaryActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

/** Компактная навигация админки на мобильных (< lg): без горизонтального скролла. */
export function AdminMobileNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="ce-admin-mobile-nav grid min-w-0 grid-cols-2 gap-2 pb-2 sm:grid-cols-3 lg:hidden"
      aria-label="Разделы админки"
    >
      {adminNavPrimary.map((item) => {
        const active = isAdminPrimaryActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2.5 text-xs font-semibold transition-colors sm:gap-2 sm:px-3 sm:text-sm",
              active
                ? "border-primary/40 bg-primary/12 text-primary shadow-sm"
                : "border-border/70 bg-card/90 text-muted-foreground hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="min-w-0 truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
