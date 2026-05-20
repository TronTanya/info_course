"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useOverlayA11y } from "@/lib/hooks/use-overlay-a11y";
import { focusRing } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

export type AdminRowMenuItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
};

export function AdminRowMenu({ items, label = "Действия" }: { items: AdminRowMenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();

  useOverlayA11y({
    open,
    onClose: () => setOpen(false),
    containerRef: menuRef,
  });

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={cn(
          "inline-flex size-11 min-h-11 min-w-11 items-center justify-center rounded-lg border border-border/80 bg-card text-muted-foreground transition-colors",
          "hover:border-primary/30 hover:bg-primary/5 hover:text-foreground",
          focusRing,
        )}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </button>
      {open ? (
        <ul
          ref={menuRef}
          id={menuId}
          className="absolute right-0 z-30 mt-1 min-w-[11rem] overflow-hidden rounded-xl border border-border/80 bg-popover py-1 shadow-lg ring-1 ring-border/60"
          role="menu"
          aria-label={label}
        >
          {items.map((item) => {
            const cls = cn(
              "block w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60",
              item.variant === "danger" ? "text-danger" : "text-foreground",
              item.disabled && "pointer-events-none opacity-50",
            );
            if (item.href && !item.disabled) {
              return (
                <li key={item.label} role="none">
                  <Link href={item.href} className={cls} role="menuitem" onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              );
            }
            return (
              <li key={item.label} role="none">
                <button
                  type="button"
                  className={cls}
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
