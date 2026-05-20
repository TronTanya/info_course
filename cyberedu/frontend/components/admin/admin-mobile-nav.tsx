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
      className="grid grid-cols-2 gap-2 pb-2 sm:grid-cols-3 lg:hidden"
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
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "border-primary/40 bg-primary/12 text-primary shadow-sm"
                : "border-border/70 bg-card/90 text-muted-foreground hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
