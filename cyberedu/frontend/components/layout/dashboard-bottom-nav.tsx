"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { studentBottomNavKeys, studentQuickNav } from "@/lib/design-system/nav-config";
import { isStudentQuickNavActive, resolveStudentNavPaths, type StudentQuickNavKey } from "@/lib/nav-resolve";
import { cn } from "@/lib/utils";

const SHORT: Record<StudentQuickNavKey, string> = {
  dashboard: "Домой",
  course: "Курс",
  lessons: "Уроки",
  tests: "Тест",
  practice: "Практ.",
  mentor: "AI",
  profile: "Проф.",
};

const navByKey = Object.fromEntries(studentQuickNav.map((item) => [item.key, item])) as Record<
  StudentQuickNavKey,
  (typeof studentQuickNav)[number]
>;

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
      <ul className="mx-auto grid w-full max-w-lg grid-cols-7 items-stretch gap-0 px-0.5 pt-1">
        {studentBottomNavKeys.map((key) => {
          const item = navByKey[key];
          if (!item) return null;
          const active = isStudentQuickNavActive(pathname, key);
          const Icon = item.icon;
          return (
            <li key={key} className="flex min-w-0 justify-center">
              <Link
                href={paths[key]}
                className={cn(
                  "flex min-h-11 w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 py-1.5",
                  "text-[9px] font-semibold leading-tight transition-colors sm:text-[10px]",
                  active ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                title={item.label}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="max-w-full truncate">{SHORT[key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
