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
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        aria-label="Закрыть панель"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "fixed inset-y-0 z-50 flex w-[min(100vw,22rem)] flex-col border-border bg-card shadow-2xl lg:hidden",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
          className,
        )}
      >
        <div className="flex min-h-11 items-center justify-between border-b border-border px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
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
