"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { LogOut, Sparkles } from "lucide-react";
import { logoutAction } from "@/lib/actions/logout";
import {
  adminNav,
  studentQuickNav,
  studentSecondaryNav,
  type NavItem,
} from "@/lib/design-system/nav-config";
import { motionPresets, motionWithReducedMotion } from "@/lib/design-system/motion";
import { isNavHrefActive } from "@/lib/nav-active";
import { isStudentQuickNavActive, resolveStudentNavPaths } from "@/lib/nav-resolve";
import { NavRailLink } from "@/components/layout/nav-rail-link";

export type AppSidebarVariant = "student" | "admin";

function AdminNavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <NavRailLink
      href={item.href}
      label={item.label}
      icon={item.icon}
      description={item.description}
      active={active}
    />
  );
}

export function AppSidebar({ variant }: { variant: AppSidebarVariant }) {
  const pathname = usePathname() ?? "";
  const paths = resolveStudentNavPaths(pathname);
  const reduce = useReducedMotion();

  return (
    <motion.aside
      className="ce-sidebar hidden min-w-0 lg:block"
      {...motionWithReducedMotion(motionPresets.slideUp, reduce)}
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

        {variant === "admin" ? (
          <nav className="flex flex-1 flex-col gap-0.5">
            {adminNav.map((item) => (
              <AdminNavLink key={item.href} item={item} active={isNavHrefActive(pathname, item.href)} />
            ))}
          </nav>
        ) : (
          <>
            <nav className="flex flex-col gap-0.5" aria-label="Основные разделы">
              {studentQuickNav.map((item) => (
                <NavRailLink
                  key={item.key}
                  href={paths[item.key]}
                  label={item.label}
                  icon={item.icon}
                  description={item.description}
                  active={isStudentQuickNavActive(pathname, item.key)}
                />
              ))}
            </nav>
            <p className="mt-4 px-3 pb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Ещё
            </p>
            <nav className="flex flex-1 flex-col gap-0.5" aria-label="Дополнительно">
              {studentSecondaryNav.map((item) => (
                <NavRailLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isNavHrefActive(pathname, item.href)}
                  compact
                />
              ))}
            </nav>
            <div className="mt-3 rounded-xl border border-cyan/20 bg-cyan/5 p-3 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <Sparkles className="size-3.5 text-cyan" aria-hidden />
                AI-наставник
              </p>
              <p className="mt-1 leading-relaxed">
                На лекции и в практике — плавающая кнопка справа внизу или{" "}
                <Link href={paths.mentor} className="font-medium text-primary hover:underline">
                  откройте лекцию
                </Link>
                .
              </p>
            </div>
          </>
        )}

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
