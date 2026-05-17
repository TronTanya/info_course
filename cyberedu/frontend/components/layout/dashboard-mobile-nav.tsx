"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { studentNav } from "@/lib/design-system/nav-config";
import { isNavHrefActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

/** Горизонтальная навигация кабинета на экранах ниже lg (sidebar скрыт). */
export function DashboardMobileNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="ce-dashboard-mobile-nav -mx-1 mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]"
      aria-label="Разделы кабинета"
    >
      {studentNav.map((item) => {
        const active = isNavHrefActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 py-2.5 text-xs font-semibold transition-colors",
              active
                ? "border-primary/40 bg-primary/12 text-primary shadow-sm"
                : "border-border/70 bg-card/90 text-muted-foreground hover:border-primary/25 hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-3.5" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
