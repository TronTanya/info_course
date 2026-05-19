"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { studentQuickNav } from "@/lib/design-system/nav-config";
import { isStudentQuickNavActive, resolveStudentNavPaths, type StudentQuickNavKey } from "@/lib/nav-resolve";
import { cn } from "@/lib/utils";

const SHORT: Record<StudentQuickNavKey, string> = {
  dashboard: "Домой",
  course: "Курс",
  tests: "Тест",
  practice: "Практ.",
  mentor: "AI",
  profile: "Проф.",
};

/** Нижняя навигация кабинета (< lg). */
export function DashboardBottomNav() {
  const pathname = usePathname() ?? "";
  const paths = resolveStudentNavPaths(pathname);

  return (
    <nav
      className="ce-dashboard-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-md lg:hidden"
      aria-label="Основная навигация"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <ul className="mx-auto flex w-full max-w-lg items-stretch justify-between gap-0 px-1.5 pt-1.5">
        {studentQuickNav.map((item) => {
          const active = isStudentQuickNavActive(pathname, item.key);
          const Icon = item.icon;
          return (
            <li key={item.key} className="flex min-w-0 flex-1 justify-center">
              <Link
                href={paths[item.key]}
                className={cn(
                  "flex min-h-11 w-full max-w-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5",
                  "text-[10px] font-semibold leading-tight transition-colors",
                  active ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="max-w-full truncate max-[359px]:hidden min-[360px]:block">{SHORT[item.key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
