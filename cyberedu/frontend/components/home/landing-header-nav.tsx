"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { guestAuthLinks, publicNavLinks } from "@/lib/design-system/nav-config";
import { FloatingNavLink } from "@/components/layout/floating-nav/floating-nav-link";
import { FloatingNavMobile, type FloatingNavMobileItem } from "@/components/layout/floating-nav/floating-nav-mobile";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { isNavHrefActive } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

function SecureModeBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "hidden items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 font-mono text-2.5 font-medium uppercase tracking-wider text-success md:inline-flex",
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
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const mobileItems: FloatingNavMobileItem[] = publicNavLinks.map((item) => ({
    href: item.href,
    label: item.label,
    active: isPublicLinkActive(pathname, item.href),
  }));

  return (
    <>
      <nav className="ce-floating-nav__links ce-floating-nav__links--lg" aria-label="Навигация">
        {publicNavLinks.map((item) => (
          <FloatingNavLink
            key={item.href}
            href={item.href}
            active={isPublicLinkActive(pathname, item.href)}
            layoutId="landing-nav-indicator"
          >
            {item.label}
          </FloatingNavLink>
        ))}
      </nav>

      <div className="ce-floating-nav__actions">
        <ThemeToggle className="hidden sm:inline-flex" />
        <SecureModeBadge />

        {isAuthenticated ? (
          <Button asChild size="sm" variant="primary" className="hidden min-h-9 rounded-full px-4 sm:inline-flex">
            <Link href={dashboardHref}>Кабинет</Link>
          </Button>
        ) : (
          <>
            <Button asChild size="sm" variant="ghost" className="hidden min-h-9 rounded-full sm:inline-flex">
              <Link href={guestAuthLinks.login}>{guestAuthLinks.loginLabel}</Link>
            </Button>
            <Button asChild size="sm" variant="primary" className="hidden min-h-9 rounded-full px-4 sm:inline-flex">
              <Link href={guestAuthLinks.register}>{guestAuthLinks.registerLabel}</Link>
            </Button>
          </>
        )}

        <button
          type="button"
          className="ce-floating-nav-menu-btn lg:hidden"
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
        title="Навигация"
        items={mobileItems}
        headerSlot={
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <SecureModeBadge className="inline-flex" />
          </div>
        }
        footerSlot={
          isAuthenticated ? (
            <Button asChild size="lg" className="w-full min-h-11 rounded-2xl">
              <Link href={dashboardHref}>Кабинет</Link>
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button asChild size="lg" variant="outline" className="w-full min-h-11 rounded-2xl">
                <Link href={guestAuthLinks.login}>{guestAuthLinks.loginLabel}</Link>
              </Button>
              <Button asChild size="lg" className="w-full min-h-11 rounded-2xl">
                <Link href={guestAuthLinks.register}>{guestAuthLinks.registerLabel}</Link>
              </Button>
            </div>
          )
        }
      />
    </>
  );
}
