"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { studentQuickNav } from "@/lib/design-system/nav-config";
import { isStudentQuickNavActive, resolveStudentNavPaths } from "@/lib/nav-resolve";
import { cn } from "@/lib/utils";

/** Компактная горизонтальная навигация в шапке (lg+, когда sidebar скрыт на планшетах — md не показываем). */
export function StudentHeaderQuickNav() {
  const pathname = usePathname() ?? "";
  const paths = resolveStudentNavPaths(pathname);

  return (
    <nav
      className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:flex xl:gap-1"
      aria-label="Разделы кабинета"
    >
      {studentQuickNav.map((item) => {
        const active = isStudentQuickNavActive(pathname, item.key);
        return (
          <Link
            key={item.key}
            href={paths[item.key]}
            className={cn(
              "rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors xl:px-2.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-primary/12 text-primary ring-1 ring-primary/25"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <span className="hidden xl:inline">{item.label}</span>
            <span className="xl:hidden">{item.label.split(/\s/)[0]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
