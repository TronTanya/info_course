"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { logoutAction } from "@/lib/actions/logout";
import { Button } from "@/components/ui/button";
import { isNavHrefActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

type NavVariant = "guest" | "user" | "admin";

const guestLinks = [
  { href: "/", label: "Главная" },
  { href: "/reviews", label: "Отзывы" },
  { href: "/auth/login", label: "Войти" },
  { href: "/auth/register", label: "Регистрация" },
];

const userLinks = [
  { href: "/dashboard/profile", label: "Профиль" },
  { href: "/dashboard/course", label: "Курс" },
  { href: "/dashboard/my-assignments", label: "Мои задания" },
  { href: "/dashboard/reviews", label: "Отзывы" },
  { href: "/dashboard/certificate", label: "Сертификат" },
  { href: "/dashboard/settings", label: "Настройки" },
];

const adminLinks = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/profile", label: "Профиль" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/modules", label: "Модули" },
  { href: "/admin/lessons", label: "Лекции" },
  { href: "/admin/tests", label: "Тесты" },
  { href: "/admin/practical-tasks", label: "Практика" },
  { href: "/admin/submissions", label: "Проверка работ" },
  { href: "/admin/certificates", label: "Сертификаты" },
  { href: "/admin/reviews", label: "Отзывы" },
];

function navLinkClass(mobile?: boolean, active?: boolean) {
  return cn(
    "rounded-xl text-sm font-medium transition-colors",
    mobile
      ? cn(
          "block w-full border px-4 py-3 text-foreground",
          active
            ? "border-primary/35 bg-primary/[0.08] text-primary shadow-sm"
            : "border-border/60 bg-card hover:bg-muted",
        )
      : cn(
          "px-3 py-2",
          active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
  const links = variant === "guest" ? guestLinks : variant === "admin" ? adminLinks : userLinks;

  const close = () => setOpen(false);

  return (
    <>
      <nav className="hidden flex-wrap items-center justify-end gap-1 xl:flex" aria-label="Основная навигация">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className={navLinkClass(false, isNavHrefActive(pathname, item.href))}>
            {item.label}
          </Link>
        ))}
        {variant !== "guest" ? (
          <form action={logoutAction} className="inline">
            <button type="submit" className={navLinkClass(false)}>
              Выйти
            </button>
          </form>
        ) : null}
      </nav>

      <div className="flex items-center gap-2 xl:hidden">
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
                <Dialog.Title className="text-base font-semibold text-foreground">Меню</Dialog.Title>
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost" size="icon" aria-label="Закрыть меню">
                    <CloseIcon />
                  </Button>
                </Dialog.Close>
              </div>
              <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-4" aria-label="Мобильная навигация">
                {variant === "admin" ? (
                  <div className="pb-1">
                    <Dialog.Close asChild>
                      <Button asChild variant="primary" className="w-full">
                        <a
                          href="/api/admin/users/export"
                          onClick={close}
                          title="Список пользователей в CSV для Excel"
                        >
                          Выгрузка отчёта (CSV)
                        </a>
                      </Button>
                    </Dialog.Close>
                  </div>
                ) : null}
                {links.map((item) => (
                  <Dialog.Close asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={navLinkClass(true, isNavHrefActive(pathname, item.href))}
                      onClick={close}
                    >
                      {item.label}
                    </Link>
                  </Dialog.Close>
                ))}
                {variant !== "guest" ? (
                  <form action={logoutAction} className="mt-2">
                    <Dialog.Close asChild>
                      <button type="submit" className={cn(navLinkClass(true), "text-left text-danger")} onClick={close}>
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
