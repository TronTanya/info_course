"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";
import { practiceHintLevelLabels } from "@/lib/practice-lab-ui";
import { cn } from "@/lib/utils";

export function PracticeLabHints({
  levels,
  className,
}: {
  /** Подсказки по уровням — без эталонных ответов. */
  levels: string[];
  className?: string;
}) {
  const [openLevel, setOpenLevel] = useState<number | null>(null);

  if (levels.length === 0) {
    return (
      <SectionCard variant="muted" flushTitle className={cn("p-4 sm:p-5", className)}>
        <p className="text-sm font-semibold text-foreground">Подсказки</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Для этого задания нет заранее подготовленных уровней — используйте AI-наставника в боковой панели (наводящие
          вопросы, без готового решения).
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard variant="default" flushTitle className={cn("p-4 sm:p-5", className)} aria-labelledby="practice-hints-heading">
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan/25 bg-cyan/10 text-cyan">
          <Lightbulb className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="practice-hints-heading" className="font-display text-base font-semibold text-foreground">
            Подсказки
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Откройте уровень по мере необходимости. Готовые ответы не показываются — только направление мысли.
          </p>
          <ol className="mt-4 space-y-2">
            {levels.map((hint, index) => {
              const open = openLevel === index;
              const panelId = `practice-hint-panel-${index}`;
              return (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => setOpenLevel(open ? null : index)}
                    className={cn(
                      "flex w-full items-start justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                      "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      open ? "border-primary/30 bg-primary/5" : "border-border/80 bg-muted/15",
                    )}
                    aria-expanded={open}
                    aria-controls={panelId}
                    aria-label={`Подсказка, уровень ${index + 1}`}
                  >
                    <span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                        {practiceHintLevelLabels[index] ?? `Уровень ${index + 1}`}
                      </span>
                      {!open ? (
                        <span className="mt-1 block text-muted-foreground">Нажмите, чтобы раскрыть подсказку</span>
                      ) : null}
                    </span>
                    <ChevronDown
                      className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
                      aria-hidden
                    />
                  </button>
                  {open ? (
                    <p
                      id={panelId}
                      className="mt-2 rounded-lg border border-border/60 bg-background/80 px-4 py-3 text-pretty text-sm leading-relaxed text-foreground/90"
                    >
                      {hint}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </SectionCard>
  );
}
