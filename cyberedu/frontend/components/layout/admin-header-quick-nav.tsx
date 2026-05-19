"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "@/lib/design-system/nav-config";
import { isNavHrefActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

/** Горизонтальные ссылки админки в шапке (lg+). */
export function AdminHeaderQuickNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto lg:flex"
      aria-label="Разделы админки"
    >
      {adminNav.map((item) => {
        const active = isNavHrefActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors xl:px-3",
              active
                ? "bg-primary/12 text-primary ring-1 ring-primary/25"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
