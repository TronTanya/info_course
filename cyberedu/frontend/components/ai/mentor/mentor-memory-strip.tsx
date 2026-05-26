"use client";

import { Brain, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MentorMemoryStrip({
  localCount,
  serverNote,
  onClearLocal,
  disabled,
}: {
  localCount: number;
  serverNote: string;
  onClearLocal: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="ce-mentor-memory flex flex-wrap items-center justify-between gap-2 border-t border-cyan/10 bg-muted/20 px-3 py-2">
      <p className="flex min-w-0 items-start gap-1.5 text-2.5 leading-snug text-muted-foreground">
        <Brain className="mt-0.5 size-3 shrink-0 text-cyan/80" aria-hidden />
        <span>
          <span className="font-medium text-foreground/80">{localCount}</span> в этой сессии · {serverNote}
        </span>
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-2.5"
        disabled={disabled || localCount === 0}
        onClick={onClearLocal}
      >
        <Eraser className="size-3" aria-hidden />
        Очистить экран
      </Button>
    </div>
  );
}
