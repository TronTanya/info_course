"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Shield, User } from "lucide-react";
import { logoutAction } from "@/lib/actions/logout";
import { studentSecondaryNav } from "@/lib/design-system/nav-config";
import { isNavHrefActive } from "@/lib/nav-active";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

export type UserMenuUser = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
};

export function UserMenu({ user, variant }: { user: UserMenuUser; variant: "user" | "admin" }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = React.useState(false);
  const panelId = React.useId();
  const isAdmin = user.role === "ADMIN";
  const close = () => setOpen(false);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!(target instanceof Element)) return;
      if (!target.closest("[data-user-menu-root]")) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  const menuItems =
    variant === "admin"
      ? [
          { href: "/dashboard", label: "Личный кабинет", icon: User },
          { href: "/admin/profile", label: "Аудит платформы", icon: Shield },
        ]
      : [
          { href: "/dashboard/profile", label: "Профиль", icon: User },
          ...studentSecondaryNav.map((item) => ({ href: item.href, label: item.label, icon: item.icon })),
          ...(isAdmin ? [{ href: "/admin", label: "Админ-панель", icon: Shield }] : []),
        ];

  return (
    <div className="relative shrink-0" data-user-menu-root>
      <button
        type="button"
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-xl border border-border/80 bg-card/90 px-2 py-1.5 text-sm font-medium",
          "transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open && "border-primary/30 bg-primary/8",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={panelId}
        aria-label={`Меню аккаунта: ${user.name?.trim() || user.email || "пользователь"}`}
        onClick={() => setOpen((v) => !v)}
      >
        <UserAvatar
          avatarUrl={user.avatarUrl}
          name={user.name}
          email={user.email}
          size="sm"
          className="rounded-lg ring-border/40"
        />
        <span className="hidden max-w-[8rem] truncate sm:inline">{user.name?.trim() || "Аккаунт"}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open ? (
        <div
          id={panelId}
          role="menu"
          className="absolute right-0 top-[calc(100%+0.35rem)] z-50 w-[min(100vw-1.5rem,16rem)] rounded-xl border border-border bg-card p-1.5 shadow-xl"
        >
          <div className="border-b border-border/70 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-foreground">{user.name?.trim() || "Пользователь"}</p>
            {user.email ? <p className="truncate text-xs text-muted-foreground">{user.email}</p> : null}
          </div>
          <ul className="py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isNavHrefActive(pathname, item.href);
              return (
                <li key={item.href} role="none">
                  <Link
                    href={item.href}
                    role="menuitem"
                    className={cn(
                      "flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
                    )}
                    onClick={close}
                  >
                    <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <form action={logoutAction} className="border-t border-border/70 pt-1">
            <button
              type="submit"
              role="menuitem"
              className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10"
            >
              <LogOut className="size-4 shrink-0" aria-hidden />
              Выйти
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
