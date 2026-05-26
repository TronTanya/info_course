"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FloatingNavMobileItem = {
  href: string;
  label: string;
  active: boolean;
  icon?: React.ComponentType<{ className?: string }>;
};

type FloatingNavMobileProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  items: FloatingNavMobileItem[];
  headerSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
};

export function FloatingNavMobile({
  open,
  onOpenChange,
  title,
  description = "Навигация",
  items,
  headerSlot,
  footerSlot,
}: FloatingNavMobileProps) {
  const close = () => onOpenChange(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="ce-floating-nav-mobile-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 motion-reduce:animate-none" />
        <Dialog.Content
          className={cn(
            "ce-floating-nav-mobile-panel outline-hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2",
            "motion-reduce:animate-none",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3.5">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">{title}</Dialog.Title>
              <Dialog.Description className="sr-only">{description}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button type="button" className="ce-floating-nav-menu-btn" aria-label="Закрыть меню">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          {headerSlot ? <div className="border-b border-white/6 px-4 py-3">{headerSlot}</div> : null}

          <nav className="flex-1 overflow-y-auto p-3" aria-label={description}>
            <ul className="flex flex-col gap-1">
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Dialog.Close asChild>
                      <Link
                        href={item.href}
                        onClick={close}
                        className={cn(
                          "ce-floating-nav-mobile-link w-full",
                          item.active && "ce-floating-nav-mobile-link--active",
                        )}
                        aria-current={item.active ? "page" : undefined}
                      >
                        {Icon ? <Icon className="size-4 shrink-0 text-primary" aria-hidden /> : null}
                        {item.label}
                      </Link>
                    </Dialog.Close>
                  </li>
                );
              })}
            </ul>
          </nav>

          {footerSlot ? <div className="border-t border-white/8 p-3">{footerSlot}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
