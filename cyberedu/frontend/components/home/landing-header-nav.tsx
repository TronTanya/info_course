"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { publicNavLinks } from "@/lib/design-system/nav-config";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { isNavHrefActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

function SecureModeBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-success",
        className,
      )}
      title="Учебная среда изолирована"
    >
      <span className="relative flex size-1.5" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex size-1.5 rounded-full bg-success" />
      </span>
      Secure
    </span>
  );
}

function MenuIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
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

type LandingHeaderNavProps = {
  isAuthenticated: boolean;
  dashboardHref: string;
};

export function LandingHeaderNav({ isAuthenticated, dashboardHref }: LandingHeaderNavProps) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = React.useState(false);
  const close = () => setOpen(false);

  const linkClass = (active: boolean, mobile?: boolean) =>
    cn(
      "rounded-xl font-medium transition-colors",
      mobile
        ? "flex min-h-11 items-center border px-4 py-3 text-base"
        : "px-3 py-2 text-sm",
      active
        ? "border-primary/35 bg-primary/10 text-primary"
        : mobile
          ? "border-border/60 text-foreground hover:bg-muted"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
    );

  return (
    <>
      <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex" aria-label="Навигация">
        {publicNavLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(isPublicLinkActive(pathname, item.href))}
            aria-current={isPublicLinkActive(pathname, item.href) ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle className="hidden sm:inline-flex" />
        <SecureModeBadge className="hidden md:inline-flex" />

        {isAuthenticated ? (
          <Button asChild size="sm" variant="primary" className="hidden sm:inline-flex shadow-sm">
            <Link href={dashboardHref}>Кабинет</Link>
          </Button>
        ) : (
          <>
            <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
              <Link href="/auth/login">Войти</Link>
            </Button>
            <Button asChild size="sm" variant="primary" className="hidden sm:inline-flex shadow-sm">
              <Link href="/auth/register">Начать</Link>
            </Button>
          </>
        )}

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button type="button" variant="outline" size="icon" className="lg:hidden" aria-label="Открыть меню">
              <MenuIcon />
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
            <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(100vw-1rem,20rem)] flex-col border-l border-border bg-card shadow-2xl outline-none">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <Dialog.Title className="text-base font-semibold">Меню</Dialog.Title>
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost" size="icon" aria-label="Закрыть">
                    <CloseIcon />
                  </Button>
                </Dialog.Close>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label="Мобильная навигация">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <ThemeToggle />
                  <SecureModeBadge className="w-fit" />
                </div>
                {publicNavLinks.map((item) => (
                  <Dialog.Close asChild key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className={linkClass(isPublicLinkActive(pathname, item.href), true)}
                    >
                      {item.label}
                    </Link>
                  </Dialog.Close>
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                  {isAuthenticated ? (
                    <Dialog.Close asChild>
                      <Button asChild size="lg" className="w-full">
                        <Link href={dashboardHref} onClick={close}>
                          Кабинет
                        </Link>
                      </Button>
                    </Dialog.Close>
                  ) : (
                    <>
                      <Dialog.Close asChild>
                        <Button asChild size="lg" variant="outline" className="w-full">
                          <Link href="/auth/login" onClick={close}>
                            Войти
                          </Link>
                        </Button>
                      </Dialog.Close>
                      <Dialog.Close asChild>
                        <Button asChild size="lg" className="w-full">
                          <Link href="/auth/register" onClick={close}>
                            Регистрация
                          </Link>
                        </Button>
                      </Dialog.Close>
                    </>
                  )}
                </div>
              </nav>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </>
  );
}
