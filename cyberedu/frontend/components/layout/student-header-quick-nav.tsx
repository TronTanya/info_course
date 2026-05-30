"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { studentHeaderNavKeys, studentQuickNav } from "@/lib/design-system/nav-config";
import { useStudentNavModuleId } from "@/hooks/use-student-nav-module-id";
import { isStudentQuickNavActive, resolveStudentNavPaths } from "@/lib/nav-resolve";
import { cn } from "@/lib/utils";

const navByKey = Object.fromEntries(studentQuickNav.map((item) => [item.key, item])) as Record<
  (typeof studentHeaderNavKeys)[number],
  (typeof studentQuickNav)[number]
>;

/** Компактная горизонтальная навигация в шапке кабинета (xl+). */
export function StudentHeaderQuickNav() {
  const pathname = usePathname() ?? "";
  const moduleId = useStudentNavModuleId();
  const paths = resolveStudentNavPaths(pathname, moduleId);

  return (
    <nav
      className="hidden"
      aria-label="Разделы кабинета"
    >
      {studentHeaderNavKeys.map((key) => {
        const item = navByKey[key];
        if (!item) return null;
        const active = isStudentQuickNavActive(pathname, key);
        return (
          <Link
            key={key}
            href={paths[key]}
            className={cn(
              "shrink-0 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors",
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
