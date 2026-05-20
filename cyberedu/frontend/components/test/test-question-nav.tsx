"use client";

import { cn } from "@/lib/utils";

export function TestQuestionNav({
  total,
  currentIndex,
  answeredFlags,
  onSelect,
  disabled,
}: {
  total: number;
  currentIndex: number;
  answeredFlags: boolean[];
  onSelect: (index: number) => void;
  disabled?: boolean;
}) {
  if (total <= 1) return null;

  return (
    <nav className="ce-scroll-x-contained -mx-1 px-1 pb-1" aria-label="Навигация по вопросам">
      <ol className="flex min-w-min gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const answered = answeredFlags[i];
          const current = i === currentIndex;
          return (
            <li key={i}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(i)}
                className={cn(
                  "flex size-11 min-h-11 min-w-11 items-center justify-center rounded-xl border text-xs font-semibold tabular-nums transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  current && "border-primary bg-primary text-primary-foreground shadow-sm",
                  !current && answered && "border-success/40 bg-success/10 text-success",
                  !current && !answered && "border-border/80 bg-muted/25 text-muted-foreground hover:border-primary/30 hover:bg-muted/40",
                )}
                aria-label={`Вопрос ${i + 1}${answered ? ", отвечен" : ", без ответа"}${current ? ", текущий" : ""}`}
                aria-current={current ? "step" : undefined}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
