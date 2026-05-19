"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardList, LayoutDashboard, User } from "lucide-react";
import { isNavHrefActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

type BottomNavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const items: BottomNavItem[] = [
  { href: "/dashboard", label: "Обзор", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/course", label: "Курс", icon: BookOpen },
  { href: "/dashboard/my-assignments", label: "Задания", icon: ClipboardList },
  { href: "/dashboard/profile", label: "Профиль", icon: User },
];

/** Нижняя навигация кабинета (< lg, когда sidebar скрыт). */
export function DashboardBottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="ce-dashboard-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-md lg:hidden"
      aria-label="Основная навигация"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 pt-2">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : isNavHrefActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-semibold transition-colors",
                  active ? "bg-primary/12 text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
