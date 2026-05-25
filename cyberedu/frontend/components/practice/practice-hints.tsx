"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, Lightbulb, Lock } from "lucide-react";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { trackAnalyticsEvent } from "@/lib/analytics/track";
import {
  canUnlockPracticeHintLevel,
  PRACTICE_HINT_DISCLAIMER,
  PRACTICE_HINT_LEVEL_META,
  PRACTICE_HINTS_EMPTY_MESSAGE,
} from "@/lib/practice-hints";
import type { PracticeHint } from "@/types/practice-view-model";
import { cn } from "@/lib/utils";

export type PracticeHintsProps = {
  hints: PracticeHint[];
  className?: string;
  moduleId?: string;
  practiceId?: string;
};

export function PracticeHints({ hints, className, moduleId, practiceId }: PracticeHintsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(() => new Set());

  const trackHintOpen = useCallback(
    (level: 1 | 2 | 3) => {
      if (!moduleId && !practiceId) return;
      trackAnalyticsEvent(AnalyticsEvents.practiceHintOpened, {
        moduleId,
        practiceId,
        hintLevel: level,
        source: "practice_hints",
      });
    },
    [moduleId, practiceId],
  );

  const handleToggle = useCallback(
    (index: number, level: 1 | 2 | 3) => {
      if (!canUnlockPracticeHintLevel(revealedIndices, index)) return;

      setOpenIndex((prev) => {
        const next = prev === index ? null : index;
        if (next === index) {
          setRevealedIndices((r) => {
            if (r.has(index)) return r;
            const updated = new Set(r);
            updated.add(index);
            return updated;
          });
          trackHintOpen(level);
        }
        return next;
      });
    },
    [revealedIndices, trackHintOpen],
  );

  const levelSubtitleByLevel = useMemo(() => {
    const map = new Map<number, string>();
    for (const m of PRACTICE_HINT_LEVEL_META) {
      map.set(m.level, m.subtitle);
    }
    return map;
  }, []);

  if (hints.length === 0) {
    return (
      <section
        className={cn(
          "ce-practice-hints ce-glass rounded-2xl border border-border/60 bg-muted/15 p-5 sm:p-6",
          className,
        )}
        aria-label="Подсказки"
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center sm:py-6">
          <div className="flex size-12 items-center justify-center rounded-xl border border-border/60 bg-muted/25 text-muted-foreground">
            <Lightbulb className="size-6" aria-hidden />
          </div>
          <h2 className="font-display text-base font-semibold text-foreground">Подсказки</h2>
          <p className="max-w-md text-sm text-muted-foreground">{PRACTICE_HINTS_EMPTY_MESSAGE}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "ce-practice-hints ce-glass relative overflow-hidden rounded-2xl",
        "border border-cyan/15 bg-linear-to-br from-card/88 via-card/75 to-cyan/[0.04]",
        "shadow-[0_0_24px_-14px_hsl(var(--cyan)/0.25)] ring-1 ring-cyan/10",
        "min-w-0 overflow-x-clip p-4 sm:p-6",
        className,
      )}
      aria-labelledby="practice-hints-heading"
    >
      <div className="relative space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-cyan/25 bg-cyan/10 text-cyan">
            <Lightbulb className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-cyan">Помощь</p>
            <h2 id="practice-hints-heading" className="font-display text-lg font-semibold text-foreground sm:text-xl">
              Подсказки
            </h2>
          </div>
        </div>

        <div
          className="flex gap-2 rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-2.5 text-sm text-foreground/90"
          role="note"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
          <p>{PRACTICE_HINT_DISCLAIMER}</p>
        </div>

        <ol className="space-y-2.5" role="list">
          {hints.map((hint, index) => {
            const open = openIndex === index;
            const unlocked = canUnlockPracticeHintLevel(revealedIndices, index);
            const panelId = `practice-hint-panel-${hint.id}`;
            const subtitle = levelSubtitleByLevel.get(hint.level) ?? PRACTICE_HINT_LEVEL_META[index]?.subtitle;

            return (
              <li key={hint.id}>
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => handleToggle(index, hint.level)}
                  className={cn(
                    "ce-touch-target flex min-h-12 w-full touch-manipulation items-start justify-between gap-2 rounded-xl border px-4 py-3.5 text-left text-sm transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    unlocked ? "hover:bg-muted/40" : "cursor-not-allowed opacity-60",
                    open && unlocked
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/80 bg-muted/15",
                  )}
                  aria-expanded={open && unlocked}
                  aria-controls={panelId}
                  aria-disabled={!unlocked}
                  aria-label={
                    unlocked
                      ? `${hint.title} — ${subtitle ?? "раскрыть"}`
                      : `${hint.title} — сначала откройте предыдущую подсказку`
                  }
                >
                  <span className="min-w-0">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                      {hint.title}
                    </span>
                    {subtitle ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">{subtitle}</span>
                    ) : null}
                    {!open && unlocked ? (
                      <span className="mt-1 block text-muted-foreground">Нажмите, чтобы раскрыть</span>
                    ) : null}
                    {!unlocked ? (
                      <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock className="size-3 shrink-0" aria-hidden />
                        Сначала откройте предыдущую подсказку
                      </span>
                    ) : null}
                  </span>
                  {unlocked ? (
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        open && "rotate-180",
                      )}
                      aria-hidden
                    />
                  ) : (
                    <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                </button>
                {open && unlocked ? (
                  <p
                    id={panelId}
                    className="mt-2 rounded-lg border border-border/60 bg-background/80 px-4 py-3 text-pretty text-sm leading-relaxed text-foreground/90"
                  >
                    {hint.content}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>

        <p className="text-xs text-muted-foreground">
          Раскрывайте подсказки по одной. Текст подсказки не отправляется в аналитику.
        </p>
      </div>
    </section>
  );
}
