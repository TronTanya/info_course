"use client";

import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import { CircleHelp, Check, RotateCcw, Lightbulb } from "lucide-react";
import { SELF_CHECK_OPTIONS } from "@/lib/lesson-checkpoints";
import { LessonSectionEmpty } from "@/components/lesson/lesson-section-empty";
import {
  buildCheckpointReaction,
  formatCheckpointProgress,
  MINI_CHECKPOINT_DISCLAIMER,
  MINI_CHECKPOINT_MAX_QUESTIONS,
  MINI_CHECKPOINT_SESSION_NOTE,
} from "@/lib/mini-checkpoint-ui";
import type { CheckpointQuestion } from "@/types/lesson-view-model";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MiniCheckpointProps = {
  questions: CheckpointQuestion[];
  className?: string;
};

function MiniCheckpointEmpty({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "ce-mini-checkpoint scroll-mt-28 ce-glass rounded-2xl border border-dashed border-border/80 bg-muted/10 p-5 sm:p-6",
        className,
      )}
      aria-labelledby="lesson-checkpoint-empty-heading"
    >
      <h2 id="lesson-checkpoint-empty-heading" className="font-display text-lg font-semibold text-foreground">
        Самопроверка
      </h2>
      <LessonSectionEmpty
        kind="checkpoint"
        className="mt-4 border-border/60 bg-transparent"
        footer={<p className="text-xs text-muted-foreground/90">{MINI_CHECKPOINT_DISCLAIMER}</p>}
      />
    </section>
  );
}

type CheckpointQuestionBlockProps = {
  item: CheckpointQuestion;
  index: number;
  total: number;
  picked: string | null;
  onPick: (optionId: string) => void;
};

function CheckpointQuestionBlock({ item, index, total, picked, onPick }: CheckpointQuestionBlockProps) {
  const choices = item.options?.length ? item.options : SELF_CHECK_OPTIONS;
  const questionId = `checkpoint-q-${item.id}`;
  const groupName = `checkpoint-${item.id}`;
  const pickedOption = choices.find((c) => c.id === picked) ?? null;
  const reaction = picked
    ? buildCheckpointReaction(picked, item.explanation, pickedOption?.feedback)
    : null;

  const handleGroupKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const idx = choices.findIndex((c) => c.id === picked);
      const current = idx >= 0 ? idx : 0;
      let next = current;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        next = (current + 1) % choices.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        next = (current - 1 + choices.length) % choices.length;
      } else if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        onPick(choices[current]!.id);
        return;
      } else {
        return;
      }

      onPick(choices[next]!.id);
      const btn = document.getElementById(`${groupName}-opt-${choices[next]!.id}`);
      btn?.focus();
    },
    [choices, groupName, onPick, picked],
  );

  return (
    <li
      className="rounded-xl border border-border/80 bg-muted/15 p-4"
      aria-labelledby={questionId}
    >
      <p id={questionId} className="text-sm font-semibold text-foreground">
        <span className="text-muted-foreground font-normal tabular-nums">
          {index + 1}/{total}.{" "}
        </span>
        {item.question}
      </p>

      <div
        role="radiogroup"
        aria-labelledby={questionId}
        className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap"
        onKeyDown={handleGroupKeyDown}
      >
        {choices.map((choice, choiceIndex) => {
          const selected = picked === choice.id;
          const tabIndex =
            selected || (picked === null && choiceIndex === 0) ? 0 : -1;

          return (
            <button
              key={choice.id}
              id={`${groupName}-opt-${choice.id}`}
              type="button"
              role="radio"
              name={groupName}
              aria-checked={selected}
              tabIndex={tabIndex}
              onClick={() => onPick(choice.id)}
              className={cn(
                "min-h-11 min-w-0 flex-1 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors motion-reduce:transition-none sm:flex-none sm:min-w-[10rem]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                selected
                  ? "border-primary/40 bg-primary/10 text-foreground ring-1 ring-primary/25"
                  : "border-border/80 bg-background/60 text-muted-foreground hover:border-primary/25 hover:text-foreground",
              )}
            >
              {choice.text}
            </button>
          );
        })}
      </div>

      {reaction ? (
        <div className="mt-3 space-y-2.5">
          <div
            className={cn(
              "flex gap-2 rounded-lg border px-3 py-2.5 text-sm leading-relaxed text-pretty",
              reaction.tone === "positive"
                ? "border-success/25 bg-success/10 text-foreground"
                : "border-amber-500/25 bg-amber-500/10 text-foreground",
            )}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {reaction.tone === "positive" ? (
              <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            ) : (
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            )}
            <p>
              <span className="font-semibold text-foreground">{reaction.statusLabel}. </span>
              {reaction.feedback}
            </p>
          </div>
          {reaction.explanation ? (
            <div
              className="rounded-lg border border-border/70 bg-card/60 px-3 py-2.5 text-sm leading-relaxed text-muted-foreground"
              aria-live="polite"
            >
              <p className="font-mono text-[10px] font-bold uppercase tracking-wide text-primary">
                Пояснение
              </p>
              <p className="mt-1 text-pretty text-foreground/90">{reaction.explanation}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

/**
 * Самопроверка в уроке (не graded test). Ответы только в памяти сессии.
 */
export function MiniCheckpoint({ questions, className }: MiniCheckpointProps) {
  const items = useMemo(
    () => questions.slice(0, MINI_CHECKPOINT_MAX_QUESTIONS),
    [questions],
  );
  const [answers, setAnswers] = useState<Record<string, string | null>>({});

  const answeredCount = items.filter((q) => answers[q.id] != null).length;
  const allAnswered = items.length > 0 && answeredCount === items.length;
  const progressLabel = formatCheckpointProgress(answeredCount, items.length);

  const setAnswer = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }, []);

  if (items.length === 0) {
    return <MiniCheckpointEmpty className={className} />;
  }

  function resetAnswers() {
    setAnswers({});
  }

  return (
    <section
      className={cn(
        "ce-mini-checkpoint scroll-mt-28 ce-glass rounded-2xl border border-cyan/20 p-5 sm:p-6",
        className,
      )}
      aria-labelledby="lesson-checkpoint-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-cyan/25 bg-cyan/10 text-cyan"
            aria-hidden
          >
            <CircleHelp className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cyan">
              Самопроверка
            </p>
            <h2 id="lesson-checkpoint-heading" className="mt-1 font-display text-lg font-semibold text-foreground">
              Проверьте понимание
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{MINI_CHECKPOINT_DISCLAIMER}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <span
            className="inline-flex min-h-9 items-center rounded-full border border-primary/25 bg-primary/10 px-3 font-mono text-xs font-semibold tabular-nums text-primary"
            role="progressbar"
            aria-label="Ответы самопроверки"
            aria-valuenow={answeredCount}
            aria-valuemin={0}
            aria-valuemax={items.length}
            aria-valuetext={`Отвечено ${progressLabel}`}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="sr-only">Прогресс: </span>
            {progressLabel}
          </span>
          {answeredCount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-9 gap-1.5 focus-visible:ring-2 focus-visible:ring-ring"
              onClick={resetAnswers}
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Сбросить
            </Button>
          ) : null}
        </div>
      </div>

      <ol className="mt-5 space-y-5" aria-label="Вопросы самопроверки">
        {items.map((item, index) => (
          <CheckpointQuestionBlock
            key={item.id}
            item={item}
            index={index}
            total={items.length}
            picked={answers[item.id] ?? null}
            onPick={(optionId) => setAnswer(item.id, optionId)}
          />
        ))}
      </ol>

      {allAnswered ? (
        <p className="mt-4 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
          {MINI_CHECKPOINT_SESSION_NOTE}
        </p>
      ) : null}
    </section>
  );
}
