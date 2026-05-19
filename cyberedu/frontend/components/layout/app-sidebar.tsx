"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/logout";
import { adminNav, studentNav, type NavItem } from "@/lib/design-system/nav-config";
import { motionPresets } from "@/lib/design-system/motion";
import { isNavHrefActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

export type AppSidebarVariant = "student" | "admin";

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        active
          ? "bg-primary/15 text-primary shadow-sm ring-1 ring-primary/30"
          : "text-muted-foreground hover:bg-primary/8 hover:text-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          active ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground group-hover:text-foreground",
        )}
        aria-hidden
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{item.label}</span>
        {item.description ? (
          <span className="mt-0.5 block truncate text-[11px] font-normal text-muted-foreground">{item.description}</span>
        ) : null}
      </span>
      {active ? <ChevronRight className="size-4 shrink-0 opacity-60" aria-hidden /> : null}
    </Link>
  );
}

export function AppSidebar({ variant }: { variant: AppSidebarVariant }) {
  const pathname = usePathname() ?? "";
  const items = variant === "admin" ? adminNav : studentNav;

  return (
    <motion.aside
      className="ce-sidebar hidden min-w-0 lg:block"
      {...motionPresets.slideUp}
      aria-label={variant === "admin" ? "Навигация админки" : "Навигация кабинета"}
    >
      <div className="ce-sidebar-inner sticky top-[calc(var(--header-height,4.5rem)+1rem)] flex max-h-[calc(100dvh-var(--header-height,4.5rem)-2rem)] flex-col gap-1 overflow-y-auto p-3">
        <div className="mb-2 flex items-center justify-between gap-2 px-2">
          <span className="ce-hud-chip">lab online</span>
          <span className="font-mono text-[10px] text-muted-foreground">v2026</span>
        </div>
        <p className="px-3 pb-2 typo-eyebrow text-primary/90">
          {variant === "admin" ? "Администрирование" : "Обучение"}
        </p>
        <nav className="flex flex-1 flex-col gap-0.5">
          {items.map((item) => (
            <NavLink key={item.href} item={item} active={isNavHrefActive(pathname, item.href)} />
          ))}
        </nav>
        {variant === "student" ? (
          <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">AI-наставник</p>
            <p className="mt-1 leading-relaxed">Доступен на страницах лекции и практики — кнопка внизу справа.</p>
          </div>
        ) : null}
        <form action={logoutAction} className="mt-auto border-t border-border/60 pt-3">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="size-4 shrink-0" aria-hidden />
            Выйти
          </button>
        </form>
      </div>
    </motion.aside>
  );
}
