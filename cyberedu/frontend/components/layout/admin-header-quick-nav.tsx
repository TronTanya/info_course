"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavPrimary } from "@/lib/design-system/nav-config";
import { isAdminPrimaryActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

/** Горизонтальные ссылки админки в шапке (lg+). */
export function AdminHeaderQuickNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="hidden"
      aria-label="Разделы админки"
    >
      {adminNavPrimary.map((item) => {
        const active = isAdminPrimaryActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors xl:px-3",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
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
