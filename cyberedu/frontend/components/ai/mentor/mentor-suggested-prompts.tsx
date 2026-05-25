"use client";

import type { SuggestedPrompt } from "@/lib/ai/mentor-ui/suggested-prompts";
import { cn } from "@/lib/utils";

export function MentorSuggestedPrompts({
  prompts,
  disabled,
  onSelect,
  variant = "default",
}: {
  prompts: SuggestedPrompt[];
  disabled?: boolean;
  onSelect: (text: string) => void;
  variant?: "default" | "compact";
}) {
  if (!prompts.length) return null;

  if (variant === "compact") {
    return (
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Примеры вопросов"
      >
        {prompts.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            aria-label={`Пример: ${p.label}`}
            onClick={() => onSelect(p.text)}
            className={cn(
              "ce-touch-target rounded-full border border-dashed border-border/80 px-2.5 py-1 text-xs text-muted-foreground",
              "transition hover:border-border hover:bg-muted/40 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="ce-mentor-prompts px-3 pb-2">
      <p
        id="mentor-suggested-prompts-label"
        className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground"
      >
        Примеры
      </p>
      <div
        className="ce-scroll-x-contained flex flex-wrap gap-1.5"
        role="group"
        aria-labelledby="mentor-suggested-prompts-label"
      >
        {prompts.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            aria-label={`Пример: ${p.label}`}
            onClick={() => onSelect(p.text)}
            className="ce-touch-target ce-mentor-prompt-chip rounded-full border px-3 py-1.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
