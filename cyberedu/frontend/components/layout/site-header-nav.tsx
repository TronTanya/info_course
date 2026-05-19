"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { logoutAction } from "@/lib/actions/logout";
import {
  adminNav,
  guestNavLinks,
  studentQuickNav,
  studentSecondaryNav,
} from "@/lib/design-system/nav-config";
import { Button } from "@/components/ui/button";
import { isNavHrefActive } from "@/lib/nav-active";
import { isStudentQuickNavActive, resolveStudentNavPaths, type StudentQuickNavKey } from "@/lib/nav-resolve";
import { cn } from "@/lib/utils";

type NavVariant = "guest" | "user" | "admin";

function navLinkClass(mobile?: boolean, active?: boolean) {
  return cn(
    "rounded-xl text-sm font-medium transition-colors",
    mobile
      ? cn(
          "flex min-h-11 w-full items-center border px-4 py-3 text-base text-foreground",
          active
            ? "border-primary/35 bg-primary/[0.08] text-primary shadow-sm"
            : "border-border/60 bg-card hover:bg-muted",
        )
      : cn(
          "px-3 py-2",
          active ? "bg-primary/10 text-primary ring-1 ring-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        ),
  );
}

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

export function SiteHeaderNav({ variant }: { variant: NavVariant }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = React.useState(false);
  const isGuest = variant === "guest";
  const isAdmin = variant === "admin";
  const paths = resolveStudentNavPaths(pathname);
  const close = () => setOpen(false);

  type DrawerLink = { href: string; label: string; key?: StudentQuickNavKey };

  const drawerLinks: DrawerLink[] = isGuest
    ? guestNavLinks
    : isAdmin
      ? adminNav.map((i) => ({ href: i.href, label: i.label }))
      : [
          ...studentQuickNav.map((i) => ({ href: paths[i.key], label: i.label, key: i.key })),
          ...studentSecondaryNav.map((i) => ({ href: i.href, label: i.label })),
        ];

  function isDrawerLinkActive(href: string, key?: StudentQuickNavKey): boolean {
    if (key && !isAdmin && !isGuest) {
      return isStudentQuickNavActive(pathname, key);
    }
    return isNavHrefActive(pathname, href);
  }

  return (
    <>
      {isGuest ? (
        <nav className="hidden flex-wrap items-center justify-end gap-1 md:flex" aria-label="Основная навигация">
          {guestNavLinks.map((item) => (
            <Link key={item.href} href={item.href} className={navLinkClass(false, isNavHrefActive(pathname, item.href))}>
              {item.label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className={navLinkClass(false, isNavHrefActive(pathname, "/auth/login"))}
          >
            Войти
          </Link>
          <Button asChild size="sm" variant="primary" className="ml-1 shadow-sm">
            <Link href="/auth/register">Регистрация</Link>
          </Button>
        </nav>
      ) : null}

      <div className={cn("flex shrink-0 items-center gap-2", isGuest ? "md:hidden" : "lg:hidden")}>
        {!isGuest && variant === "user" ? (
          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
            <Link href={paths.profile}>Профиль</Link>
          </Button>
        ) : null}

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button type="button" variant="outline" size="icon" className="shrink-0" aria-label="Открыть меню">
              <MenuIcon />
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content
              className={cn(
                "fixed inset-y-0 right-0 z-50 flex w-[min(100vw-1rem,20rem)] flex-col border-l border-border bg-card shadow-2xl outline-none",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-200",
              )}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <Dialog.Title className="text-base font-semibold text-foreground">
                  {isGuest ? "Меню" : isAdmin ? "Админка" : "Кабинет"}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost" size="icon" aria-label="Закрыть меню">
                    <CloseIcon />
                  </Button>
                </Dialog.Close>
              </div>
              <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-4" aria-label="Мобильная навигация">
                {isAdmin ? (
                  <div className="pb-1">
                    <Dialog.Close asChild>
                      <Button asChild variant="primary" className="w-full">
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
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/auth/login" onClick={close}>
                          Войти
                        </Link>
                      </Button>
                    </Dialog.Close>
                    <Dialog.Close asChild>
                      <Button asChild variant="primary" className="w-full">
                        <Link href="/auth/register" onClick={close}>
                          Регистрация
                        </Link>
                      </Button>
                    </Dialog.Close>
                  </div>
                ) : null}
                {drawerLinks.map((item) => {
                  const linkKey = item.key ?? item.href;
                  const active = isDrawerLinkActive(item.href, item.key);
                  return (
                    <Dialog.Close asChild key={linkKey}>
                      <Link href={item.href} className={navLinkClass(true, active)} onClick={close}>
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
    </>
  );
}
