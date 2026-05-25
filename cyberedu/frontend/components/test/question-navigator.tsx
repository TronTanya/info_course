"use client";

import { Check } from "lucide-react";
import {
  buildQuestionNavigatorCounts,
  buildQuestionNavigatorAriaLabel,
  questionNavigatorStatusLabel,
  resolveQuestionNavigatorStatus,
  type QuestionNavigatorItemStatus,
} from "@/lib/test-question-navigator";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/utils";

export type QuestionNavigatorProps = {
  total: number;
  currentIndex: number;
  answeredFlags: boolean[];
  /** Какие вопросы пользователь уже открывал (кроме текущего он всегда считается открытым). */
  openedFlags?: boolean[];
  /** false — только сводка прогресса без перехода по номерам */
  allowFreeNavigation?: boolean;
  onSelect?: (index: number) => void;
  disabled?: boolean;
  className?: string;
};

const STATUS_RING: Record<QuestionNavigatorItemStatus, string> = {
  current: "border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/40",
  answered: "border-success/45 bg-success/12 text-success",
  opened: "border-dashed border-border/90 bg-muted/20 text-muted-foreground",
  not_opened: "border-border/80 bg-muted/10 text-muted-foreground",
};

function NavigatorLegend() {
  const items: QuestionNavigatorItemStatus[] = ["current", "answered", "opened", "not_opened"];
  return (
    <ul className="hidden flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground md:flex" aria-hidden>
      {items.map((status) => (
        <li key={status} className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "size-2.5 rounded-full border",
              status === "current" && "border-primary bg-primary",
              status === "answered" && "border-success/50 bg-success/40",
              status === "opened" && "border-border bg-muted/40",
              status === "not_opened" && "border-border/70 bg-background",
            )}
          />
          <span>{questionNavigatorStatusLabel(status)}</span>
        </li>
      ))}
    </ul>
  );
}

function NavigatorSummary({ counts, total }: { counts: ReturnType<typeof buildQuestionNavigatorCounts>; total: number }) {
  return (
    <dl className="grid min-w-0 grid-cols-2 gap-2 text-xs md:grid-cols-4">
      <div className="rounded-lg border border-border/70 bg-muted/15 px-2.5 py-2">
        <dt className="text-muted-foreground">Отвечено</dt>
        <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
          {counts.answered} <span className="font-normal text-muted-foreground">/ {total}</span>
        </dd>
      </div>
      <div className="rounded-lg border border-border/70 bg-muted/15 px-2.5 py-2">
        <dt className="text-muted-foreground">Пропущено</dt>
        <dd className="mt-0.5 font-semibold tabular-nums text-foreground">{counts.skipped}</dd>
      </div>
      <div className="rounded-lg border border-border/70 bg-muted/15 px-2.5 py-2">
        <dt className="text-muted-foreground">Открыто</dt>
        <dd className="mt-0.5 font-semibold tabular-nums text-foreground">{counts.opened}</dd>
      </div>
      <div className="rounded-lg border border-border/70 bg-muted/15 px-2.5 py-2">
        <dt className="text-muted-foreground">Не открыто</dt>
        <dd className="mt-0.5 font-semibold tabular-nums text-foreground">{counts.notOpened}</dd>
      </div>
    </dl>
  );
}

export function QuestionNavigator({
  total,
  currentIndex,
  answeredFlags,
  openedFlags: openedFlagsProp,
  allowFreeNavigation = true,
  onSelect,
  disabled,
  className,
}: QuestionNavigatorProps) {
  if (total <= 0) return null;

  const openedFlags =
    openedFlagsProp ??
    Array.from({ length: total }, (_, i) => i === currentIndex);

  const counts = buildQuestionNavigatorCounts(answeredFlags, openedFlags);
  const progressPct = total > 0 ? Math.round((counts.answered / total) * 100) : 0;

  if (!allowFreeNavigation) {
    return (
      <section
        className={cn("ce-question-navigator space-y-3", className)}
        aria-label="Прогресс по вопросам"
      >
        <NavigatorSummary counts={counts} total={total} />
        <ProgressBar
          label="Отвечено на вопросы"
          value={counts.answered}
          max={total}
          tone={counts.answered === total ? "success" : "default"}
        />
        <p className="text-xs text-muted-foreground" role="status">
          Свободная навигация между вопросами отключена — используйте кнопки «Назад» и «Далее».
        </p>
        <p className="sr-only" aria-live="polite">
          Отвечено {counts.answered} из {total}, пропущено {counts.skipped}, открыто без ответа {counts.opened},
          не открыто {counts.notOpened}. Заполнение {progressPct} процентов.
        </p>
      </section>
    );
  }

  if (total <= 1) {
    return (
      <section className={cn("ce-question-navigator space-y-2", className)} aria-label="Навигация по вопросам">
        <NavigatorSummary counts={counts} total={total} />
      </section>
    );
  }

  return (
    <section className={cn("ce-question-navigator space-y-3", className)} aria-label="Навигация по вопросам">
      <h3 className="sr-only">Навигация по вопросам</h3>
      <NavigatorSummary counts={counts} total={total} />
      <NavigatorLegend />
      <nav className="ce-scroll-x-contained -mx-1 px-1 pb-1" aria-label="Перейти к вопросу">
        <ol className="flex min-w-min gap-1.5">
          {Array.from({ length: total }, (_, i) => {
            const status = resolveQuestionNavigatorStatus(i, currentIndex, answeredFlags, openedFlags);
            const answered = status === "answered";
            const current = status === "current";
            const label = buildQuestionNavigatorAriaLabel(i + 1, status);

            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect?.(i)}
                  className={cn(
                    "relative flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-1.5 text-xs font-semibold transition-colors motion-reduce:transition-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    STATUS_RING[status],
                    !disabled && !current && "hover:border-primary/35 hover:bg-primary/5",
                  )}
                  aria-label={label}
                  aria-current={current ? "step" : undefined}
                >
                  <span className="inline-flex items-center gap-0.5 tabular-nums">
                    {answered && !current ? (
                      <>
                        <Check className="size-3.5 shrink-0" aria-hidden />
                        <span className="sr-only">Вопрос {i + 1}</span>
                      </>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "hidden max-w-[3.25rem] truncate text-[9px] font-normal leading-none sm:inline",
                      current ? "text-primary-foreground/90" : "opacity-80",
                    )}
                    aria-hidden
                  >
                    {questionNavigatorStatusLabel(status)}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <p className="sr-only" aria-live="polite">
        Отвечено {counts.answered}, пропущено {counts.skipped}. Текущий вопрос {currentIndex + 1}.
      </p>
    </section>
  );
}
