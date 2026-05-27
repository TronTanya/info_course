"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { LogOut, Sparkles } from "lucide-react";
import { logoutAction } from "@/lib/actions/logout";
import {
  adminNavContent,
  adminNavPrimary,
  adminNavSecondary,
  studentQuickNav,
  studentSecondaryNav,
  type NavItem,
} from "@/lib/design-system/nav-config";
import { navVariants } from "@/lib/design-system/components";
import { motionPresets, motionWithReducedMotion } from "@/lib/design-system/motion";
import { isNavHrefActive, isAdminPrimaryActive } from "@/lib/nav-active";
import { isStudentQuickNavActive, resolveStudentNavPaths } from "@/lib/nav-resolve";
import { NavRailLink } from "@/components/layout/nav-rail-link";
import { cn } from "@/lib/utils";

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
      className={cn(navVariants.sidebar, "hidden shrink-0 lg:block")}
      {...motionWithReducedMotion(motionPresets.slideUp, reduce)}
      aria-label={variant === "admin" ? "Навигация админки" : "Навигация кабинета"}
    >
      <div
        className={cn(
          navVariants.panel,
          "ce-cockpit-sidebar ce-sidebar-inner sticky top-[calc(var(--header-height,4.5rem)+1rem)] max-h-[calc(100dvh-var(--header-height,4.5rem)-2rem)]",
        )}
      >
        <p className="px-3 pb-2 typo-eyebrow text-primary/90">
          {variant === "admin" ? "Администрирование" : "Обучение"}
        </p>

        {variant === "admin" ? (
          <>
            <nav className="flex flex-col gap-0.5" aria-label="Основные разделы">
              {adminNavPrimary.map((item) => (
                <AdminNavLink
                  key={item.href}
                  item={item}
                  active={isAdminPrimaryActive(pathname, item.href)}
                />
              ))}
            </nav>
            <p className="mt-4 px-3 pb-1 font-mono text-2.5 font-bold uppercase tracking-wider text-muted-foreground">
              Контент
            </p>
            <nav className="flex flex-col gap-0.5" aria-label="Управление контентом">
              {adminNavContent.map((item) => (
                <AdminNavLink key={item.href} item={item} active={isNavHrefActive(pathname, item.href)} />
              ))}
            </nav>
            {adminNavSecondary.length > 0 ? (
              <>
                <p className="mt-4 px-3 pb-1 font-mono text-2.5 font-bold uppercase tracking-wider text-muted-foreground">
                  Ещё
                </p>
                <nav className="flex flex-1 flex-col gap-0.5" aria-label="Дополнительно">
                  {adminNavSecondary.map((item) => (
                    <AdminNavLink key={item.href} item={item} active={isNavHrefActive(pathname, item.href)} />
                  ))}
                </nav>
              </>
            ) : null}
          </>
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
            <p className="mt-4 px-3 pb-1 font-mono text-2.5 font-bold uppercase tracking-wider text-muted-foreground">
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
                  откройте урок
                </Link>
                .
              </p>
            </div>
          </>
        )}

        <form action={logoutAction} className="mt-auto border-t border-border/60 pt-3">
          <button
            type="submit"
            className="flex w-full min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="size-4 shrink-0" aria-hidden />
            Выйти
          </button>
        </form>
      </div>
    </motion.aside>
  );
}
