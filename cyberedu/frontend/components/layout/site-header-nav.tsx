"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  adminNav,
  guestAuthLinks,
  guestNavLinks,
  publicNavLinks,
  studentQuickNav,
  studentSecondaryNav,
} from "@/lib/design-system/nav-config";
import { logoutAction } from "@/lib/actions/logout";
import { Button } from "@/components/ui/button";
import { isNavHrefActive, isAdminPrimaryActive } from "@/lib/nav-active";
import { isStudentQuickNavActive, resolveStudentNavPaths, type StudentQuickNavKey } from "@/lib/nav-resolve";
import { navLinkClass } from "@/components/layout/nav-link-styles";
import { UserMenu, type UserMenuUser } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

type NavVariant = "guest" | "user" | "admin";

function MenuIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

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
  const [open, setOpen] = React.useState(false);
  const isGuest = variant === "guest";
  const isAdmin = variant === "admin";
  const paths = resolveStudentNavPaths(pathname);
  const close = () => setOpen(false);

  type DrawerLink = { href: string; label: string; key?: StudentQuickNavKey; icon?: React.ComponentType<{ className?: string }> };

  const drawerLinks: DrawerLink[] = isGuest
    ? guestNavLinks.map((i) => ({ href: i.href, label: i.label }))
    : isAdmin
      ? adminNav.map((i) => ({ href: i.href, label: i.label, icon: i.icon }))
      : [
          ...studentQuickNav.map((i) => ({ href: paths[i.key], label: i.label, key: i.key, icon: i.icon })),
          ...studentSecondaryNav.map((i) => ({ href: i.href, label: i.label, icon: i.icon })),
        ];

  function isDrawerLinkActive(href: string, key?: StudentQuickNavKey): boolean {
    if (key && !isAdmin && !isGuest) {
      return isStudentQuickNavActive(pathname, key);
    }
    if (isAdmin && href === "/admin/modules") {
      return isAdminPrimaryActive(pathname, href);
    }
    return isNavHrefActive(pathname, href);
  }

  return (
    <>
      {isGuest ? (
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 md:flex" aria-label="Основная навигация">
          {publicNavLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClass(false, isPublicLinkActive(pathname, item.href))}
              aria-current={isPublicLinkActive(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={guestAuthLinks.login}
            className={navLinkClass(false, isNavHrefActive(pathname, guestAuthLinks.login))}
          >
            {guestAuthLinks.loginLabel}
          </Link>
          <Button asChild size="sm" variant="primary" className="ml-1 shadow-sm">
            <Link href={guestAuthLinks.register}>{guestAuthLinks.registerLabel}</Link>
          </Button>
        </nav>
      ) : null}

      <div className={cn("ml-auto flex shrink-0 items-center gap-2", isGuest ? "md:ml-0" : "")}>
        {!isGuest && user ? <UserMenu user={user} variant={isAdmin ? "admin" : "user"} /> : null}

        <div className={cn("flex shrink-0 items-center gap-2", isGuest ? "md:hidden" : "lg:hidden")}>
          {isGuest ? (
            <Button asChild size="sm" variant="primary" className="sm:hidden">
              <Link href={guestAuthLinks.register}>Старт</Link>
            </Button>
          ) : null}

          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button type="button" variant="outline" size="icon" className="shrink-0 min-h-11 min-w-11" aria-label="Открыть меню">
                <MenuIcon />
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content
                className={cn(
                  "fixed inset-y-0 z-50 flex w-[min(100vw-1rem,20rem)] flex-col border-border bg-card shadow-2xl outline-none",
                  isGuest
                    ? "right-0 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
                    : "left-0 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
                  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200",
                )}
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <Dialog.Title className="text-base font-semibold text-foreground">
                    {isGuest ? "Меню" : isAdmin ? "Админка" : "Кабинет"}
                  </Dialog.Title>
                  <Dialog.Description className="sr-only">
                    {isGuest
                      ? "Навигация по сайту и ссылки для входа"
                      : isAdmin
                        ? "Быстрый переход по разделам админки"
                        : "Навигация по кабинету обучения"}
                  </Dialog.Description>
                  <Dialog.Close asChild>
                    <Button type="button" variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Закрыть меню">
                      <CloseIcon />
                    </Button>
                  </Dialog.Close>
                </div>
                <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-4" aria-label="Мобильная навигация">
                  {isAdmin ? (
                    <div className="pb-1">
                      <Dialog.Close asChild>
                        <Button asChild variant="primary" className="w-full min-h-11">
                          <a href="/api/admin/users/export" onClick={close} title="CSV для Excel">
                            Выгрузка CSV
                          </a>
                        </Button>
                      </Dialog.Close>
                    </div>
                  ) : null}
                  {isGuest ? (
                    <div className="mb-2 flex flex-col gap-2 border-b border-border pb-4">
                      <Dialog.Close asChild>
                        <Button asChild variant="outline" className="w-full min-h-11">
                          <Link href={guestAuthLinks.login} onClick={close}>
                            {guestAuthLinks.loginLabel}
                          </Link>
                        </Button>
                      </Dialog.Close>
                      <Dialog.Close asChild>
                        <Button asChild variant="primary" className="w-full min-h-11">
                          <Link href={guestAuthLinks.register} onClick={close}>
                            {guestAuthLinks.registerLabel}
                          </Link>
                        </Button>
                      </Dialog.Close>
                    </div>
                  ) : null}
                  {drawerLinks.map((item) => {
                    const linkKey = item.key ?? item.href;
                    const active = isDrawerLinkActive(item.href, item.key);
                    const Icon = item.icon;
                    return (
                      <Dialog.Close asChild key={linkKey}>
                        <Link href={item.href} className={navLinkClass(true, active)} onClick={close}>
                          {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
                          {item.label}
                        </Link>
                      </Dialog.Close>
                    );
                  })}
                  {!isGuest ? (
                    <form action={logoutAction} className="mt-2 border-t border-border pt-4">
                      <Dialog.Close asChild>
                        <button
                          type="submit"
                          className={cn(navLinkClass(true), "w-full text-left text-danger")}
                          onClick={close}
                        >
                          Выйти
                        </button>
                      </Dialog.Close>
                    </form>
                  ) : null}
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </>
  );
}
