"use client";

import { Brain, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMentorClearConfirmMessage } from "@/lib/ai/mentor-ui/mentor-a11y";

export function MentorMemoryStrip({
  localCount,
  serverNote,
  onClearConversation,
  disabled,
  clearing,
  clearsServerHistory = true,
}: {
  localCount: number;
  serverNote: string;
  onClearConversation: () => void;
  disabled?: boolean;
  clearing?: boolean;
  /** false — только локальная сессия (практика). */
  clearsServerHistory?: boolean;
}) {
  function handleClear() {
    if (localCount > 0) {
      const ok = window.confirm(getMentorClearConfirmMessage(clearsServerHistory));
      if (!ok) return;
    }
    onClearConversation();
  }

  return (
    <div className="ce-mentor-memory shrink-0 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-muted/30 px-3 py-2 dark:border-cyan/15 dark:bg-[color-mix(in_oklab,var(--terminal-bg-chrome)_88%,transparent)]">
      <p className="flex min-w-0 items-start gap-1.5 text-[10px] leading-snug text-muted-foreground">
        <Brain className="mt-0.5 size-3 shrink-0 text-cyan/80" aria-hidden />
        <span>
          <span className="font-medium text-foreground/80">{localCount}</span> в этой сессии · {serverNote}
        </span>
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-[10px] focus-visible:ring-2 focus-visible:ring-cyan/60"
        disabled={disabled || clearing || localCount === 0}
        loading={clearing}
        aria-label={
          localCount === 0
            ? "Очистить диалог — нет сообщений"
            : "Очистить диалог с подтверждением"
        }
        onClick={handleClear}
      >
        <Eraser className="size-3" aria-hidden />
        Очистить диалог
      </Button>
    </div>
  );
}
