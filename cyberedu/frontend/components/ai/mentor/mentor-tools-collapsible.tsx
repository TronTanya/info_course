"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function MentorToolsCollapsible({
  hasConversation,
  children,
  className,
}: {
  /** true — в диалоге уже есть сообщения; панель по умолчанию свёрнута */
  hasConversation: boolean;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(!hasConversation);
  const panelId = useId();

  useEffect(() => {
    if (!hasConversation) setOpen(true);
  }, [hasConversation]);

  return (
    <div className={cn("ce-mentor-tools shrink-0 border-t border-border/60", className)}>
      <button
        type="button"
        className="ce-touch-target flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex min-w-0 items-center gap-2">
          <SlidersHorizontal className="size-3.5 shrink-0 text-cyan" aria-hidden />
          <span className="text-xs font-semibold text-foreground">Режимы и подсказки</span>
        </span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className={cn("ce-mentor-tools__body border-t border-border/40", !open && "hidden")}
      >
        {children}
      </div>
    </div>
  );
}
