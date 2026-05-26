"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  adminNav,
  guestAuthLinks,
  guestNavLinks,
  publicNavLinks,
  studentQuickNav,
  studentSecondaryNav,
} from "@/lib/design-system/nav-config";
import { logoutAction } from "@/lib/actions/logout";
import { FloatingNavLink } from "@/components/layout/floating-nav/floating-nav-link";
import { FloatingNavMobile, type FloatingNavMobileItem } from "@/components/layout/floating-nav/floating-nav-mobile";
import { CommandPaletteTrigger } from "@/components/layout/command-palette-provider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { isNavHrefActive, isAdminPrimaryActive } from "@/lib/nav-active";
import { isStudentQuickNavActive, resolveStudentNavPaths, type StudentQuickNavKey } from "@/lib/nav-resolve";
import { UserMenu, type UserMenuUser } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

type NavVariant = "guest" | "user" | "admin";

function isPublicLinkActive(pathname: string, href: string): boolean {
  if (href.startsWith("/#")) return pathname === "/";
  return isNavHrefActive(pathname, href);
}

export function SiteHeaderNav({
  variant,
  user,
}: {
  variant: NavVariant;
  user?: UserMenuUser | null;
}) {
  const pathname = usePathname() ?? "";
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isGuest = variant === "guest";
  const isAdmin = variant === "admin";
  const paths = resolveStudentNavPaths(pathname);

  type DrawerLink = {
    href: string;
    label: string;
    key?: StudentQuickNavKey;
    icon?: React.ComponentType<{ className?: string }>;
  };

  const drawerLinks: DrawerLink[] = isGuest
    ? guestNavLinks.map((i) => ({ href: i.href, label: i.label }))
    : isAdmin
      ? adminNav.map((i) => ({ href: i.href, label: i.label, icon: i.icon }))
      : [
          ...studentQuickNav.map((i) => ({ href: paths[i.key], label: i.label, key: i.key, icon: i.icon })),
          ...studentSecondaryNav.map((i) => ({ href: i.href, label: i.label, icon: i.icon })),
        ];

  function isDrawerLinkActive(href: string, key?: StudentQuickNavKey): boolean {
    if (key && !isAdmin && !isGuest) return isStudentQuickNavActive(pathname, key);
    if (isAdmin && href === "/admin/modules") return isAdminPrimaryActive(pathname, href);
    return isNavHrefActive(pathname, href);
  }

  const mobileItems: FloatingNavMobileItem[] = drawerLinks.map((item) => ({
    href: item.href,
    label: item.label,
    active: isDrawerLinkActive(item.href, item.key),
    icon: item.icon,
  }));

  const layoutId = isGuest ? "guest-nav-indicator" : isAdmin ? "admin-nav-indicator" : "app-nav-indicator";

  return (
    <>
      {isGuest ? (
        <nav className="ce-floating-nav__links ce-floating-nav__links--md" aria-label="Основная навигация">
          {publicNavLinks.map((item) => (
            <FloatingNavLink
              key={item.href}
              href={item.href}
              active={isPublicLinkActive(pathname, item.href)}
              layoutId={layoutId}
            >
              {item.label}
            </FloatingNavLink>
          ))}
          <span className="ce-floating-nav__divider hidden md:block" aria-hidden />
          <FloatingNavLink href={guestAuthLinks.login} active={isNavHrefActive(pathname, guestAuthLinks.login)} layoutId={layoutId}>
            {guestAuthLinks.loginLabel}
          </FloatingNavLink>
        </nav>
      ) : isAdmin ? (
        <nav className="ce-floating-nav__links ce-floating-nav__links--xl" aria-label="Разделы админки">
          {adminNav.slice(0, 5).map((item) => (
            <FloatingNavLink
              key={item.href}
              href={item.href}
              active={
                item.href === "/admin/modules"
                  ? isAdminPrimaryActive(pathname, item.href)
                  : isNavHrefActive(pathname, item.href)
              }
              layoutId={layoutId}
            >
              {item.label}
            </FloatingNavLink>
          ))}
        </nav>
      ) : (
        <nav className="ce-floating-nav__links ce-floating-nav__links--xl" aria-label="Разделы кабинета">
          {studentQuickNav.slice(0, 4).map((item) => (
            <FloatingNavLink
              key={item.key}
              href={paths[item.key]}
              active={isStudentQuickNavActive(pathname, item.key)}
              layoutId={layoutId}
            >
              {item.label}
            </FloatingNavLink>
          ))}
        </nav>
      )}

      <div className="ce-floating-nav__actions">
        {isAdmin ? (
          <Button asChild variant="primary" size="sm" className="hidden min-h-9 rounded-full px-3 lg:inline-flex">
            <a
              href="/api/admin/users/export"
              title="Список пользователей в CSV"
              aria-label="Выгрузить CSV"
            >
              <span className="hidden xl:inline">CSV</span>
              <span className="xl:hidden">↓</span>
            </a>
          </Button>
        ) : null}
        {!isGuest ? <CommandPaletteTrigger /> : null}
        <ThemeToggle className="hidden sm:inline-flex" />
        {!isGuest && user ? <UserMenu user={user} variant={isAdmin ? "admin" : "user"} /> : null}

        {isGuest ? (
          <Button asChild size="sm" variant="primary" className="hidden min-h-9 rounded-full px-4 sm:inline-flex md:hidden">
            <Link href={guestAuthLinks.register}>Старт</Link>
          </Button>
        ) : null}

        <button
          type="button"
          className={cn("ce-floating-nav-menu-btn", isGuest ? "md:hidden" : "xl:hidden")}
          aria-label="Открыть меню"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-4" />
        </button>
      </div>

      <FloatingNavMobile
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        title={isGuest ? "Меню" : isAdmin ? "Админка" : "Кабинет"}
        items={mobileItems}
        headerSlot={
          isAdmin ? (
            <Button asChild variant="primary" className="w-full min-h-10 rounded-2xl">
              <a href="/api/admin/users/export" title="CSV для Excel">
                Выгрузка CSV
              </a>
            </Button>
          ) : isGuest ? null : undefined
        }
        footerSlot={
          isGuest ? (
            <div className="flex flex-col gap-2">
              <ThemeToggle className="mx-auto min-h-11 w-full max-w-48 rounded-2xl border border-border" />
              <Button asChild size="lg" variant="outline" className="w-full min-h-11 rounded-2xl">
                <Link href={guestAuthLinks.login}>{guestAuthLinks.loginLabel}</Link>
              </Button>
              <Button asChild size="lg" className="w-full min-h-11 rounded-2xl">
                <Link href={guestAuthLinks.register}>{guestAuthLinks.registerLabel}</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {!isAdmin ? (
                <CommandPaletteTrigger
                  showLabel
                  className="w-full min-h-11 justify-center rounded-2xl"
                  onActivate={() => setMobileOpen(false)}
                />
              ) : null}
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-border px-3 py-2">
                <span className="text-sm font-medium text-foreground">Тема</span>
                <ThemeToggle />
              </div>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" className="w-full min-h-11 rounded-2xl text-danger hover:text-danger">
                  Выйти
                </Button>
              </form>
            </div>
          )
        }
      />
    </>
  );
}
