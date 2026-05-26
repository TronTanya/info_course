"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOverlayA11y } from "@/lib/hooks/use-overlay-a11y";
import { cn } from "@/lib/utils";

export type MobileDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  side?: "left" | "right";
  className?: string;
};

export function MobileDrawer({
  open,
  onOpenChange,
  title,
  children,
  side = "right",
  className,
}: MobileDrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useOverlayA11y({
    open,
    onClose: () => onOpenChange(false),
    containerRef: panelRef,
  });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-background/75 backdrop-blur-md lg:hidden"
        aria-label="Закрыть панель"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "ce-mobile-drawer-panel ce-mobile-drawer-panel--sheet fixed z-50 flex flex-col lg:hidden",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
          className,
        )}
      >
        <div className="ce-mobile-sheet__handle mt-2 lg:hidden" aria-hidden />
        <div className="flex min-h-11 items-center justify-between border-b border-white/8 px-4 py-3">
          <h2 id={titleId} className="font-heading text-base font-semibold text-foreground">
            {title}
          </h2>
          <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Закрыть">
            <X className="size-5" aria-hidden />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">{children}</div>
      </div>
    </>
  );
}
