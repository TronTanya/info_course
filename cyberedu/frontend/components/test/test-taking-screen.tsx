"use client";

import { useCallback, useId } from "react";
import type { ClientTestQuestion } from "@/lib/test-grading";
import type { QuestionType } from "@prisma/client";
import type { TestLocalAnswers } from "@/lib/test-taking";
import { testTimeLimitSeconds } from "@/lib/test-taking";
import { useTestTakingDisplayTimer } from "@/lib/hooks/use-test-taking-display-timer";
import { TestAnswerOption } from "@/components/test/test-answer-option";
import { QuestionNavigator } from "@/components/test/question-navigator";
import { TestSubmitConfirmation } from "@/components/test/test-submit-confirmation";
import { TestTakingTimer } from "@/components/test/test-taking-timer";
import { Button } from "@/components/ui/button";
import { TestClientErrorBanner } from "@/components/test/test-page-states";
import { FormFeedback } from "@/components/ui/form-feedback";
import { PendingBanner } from "@/components/ui/pending-banner";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Textarea } from "@/components/ui/textarea";
import { useTestTakingKeyboard } from "@/lib/hooks/use-test-taking-keyboard";
import { testAnswerOptionsLegend } from "@/lib/test-a11y";
import { formatRemainingQuestions, testKeyboardHints } from "@/lib/test-ui";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

export type { TestLocalAnswers } from "@/lib/test-taking";

function typeLabel(t: QuestionType): string {
  switch (t) {
    case "SINGLE_CHOICE":
      return "Один вариант";
    case "MULTIPLE_CHOICE":
      return "Несколько вариантов";
    case "TRUE_FALSE":
      return "Верно / неверно";
    case "TEXT":
      return "Текстовый ответ";
    case "SITUATION":
      return "Ситуация";
    case "MATCHING":
      return "Сопоставление";
    default:
      return String(t);
  }
}

export type TestTakingScreenProps = {
  title: string;
  moduleTitle?: string;
  minScore: number;
  maxScore: number;
  questions: ClientTestQuestion[];
  currentIndex: number;
  answers: TestLocalAnswers;
  error: string | null;
  pending: boolean;
  answeredCount: number;
  answeredFlags: boolean[];
  submitDialogOpen: boolean;
  onSubmitDialogOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
  onSingleSelect: (questionId: string, answerId: string) => void;
  onMultiToggle: (questionId: string, answerId: string) => void;
  onTextChange: (questionId: string, text: string) => void;
  onRequestSubmit: () => void;
  onConfirmSubmit: () => void;
  onRetrySubmit?: () => void;
  /** Черновик в sessionStorage активен */
  draftSaved?: boolean;
  /** Жёсткий лимит (мин); только отображение + onTimeExpired */
  timeLimitMinutes?: number | null;
  sessionStartedAtMs?: number | null;
  onTimeExpired?: () => void;
  timeExpiredNotice?: boolean;
  openedFlags?: boolean[];
  allowFreeNavigation?: boolean;
  className?: string;
};

/**
 * Экран прохождения теста: один вопрос за раз, навигация, черновик, без проверки на клиенте.
 */
export function TestTakingScreen({
  title,
  moduleTitle,
  minScore,
  maxScore,
  questions,
  currentIndex: idx,
  answers: local,
  error,
  pending,
  answeredCount,
  answeredFlags,
  submitDialogOpen: submitOpen,
  onSubmitDialogOpenChange: onSubmitOpenChange,
  onIndexChange,
  onSingleSelect: onSingle,
  onMultiToggle,
  onTextChange: onText,
  onRequestSubmit: onRequestFinish,
  onConfirmSubmit,
  onRetrySubmit,
  draftSaved: draftNote,
  timeLimitMinutes = null,
  sessionStartedAtMs = null,
  onTimeExpired,
  timeExpiredNotice = false,
  openedFlags,
  allowFreeNavigation = true,
  className,
}: TestTakingScreenProps) {
  const total = questions.length;
  const q = questions[idx];
  const questionHeadingId = useId();
  const keyboardHintId = useId();
  const fieldDescribedBy =
    [error ? "test-form-error" : null, q.questionType !== "TEXT" && q.answers.length > 0 ? keyboardHintId : null]
      .filter(Boolean)
      .join(" ") || undefined;
  const durationSeconds = testTimeLimitSeconds(timeLimitMinutes);

  const handleExpire = useCallback(() => {
    onTimeExpired?.();
  }, [onTimeExpired]);

  const timer = useTestTakingDisplayTimer({
    enabled: Boolean(durationSeconds) && !pending,
    startedAtMs: sessionStartedAtMs,
    durationSeconds,
    onExpire: handleExpire,
  });

  useTestTakingKeyboard({
    enabled: !pending && !submitOpen && Boolean(q),
    question: q,
    index: idx,
    total,
    onIndexChange,
    onSingle,
    onMultiToggle,
  });

  if (!q) return null;

  const progressPct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  const unansweredIndexes = questions
    .map((qq, i) => (!answeredFlags[i] ? i + 1 : null))
    .filter((n): n is number => n != null);
  const remainingLabel = formatRemainingQuestions(answeredCount, total);
  const allAnswered = answeredCount === total;

  return (
    <div
      className={cn(
        "ce-test-taking-screen ce-test-taking ce-immersive-mobile-pad",
        cyber.panel,
        "card-gradient min-w-0 space-y-0 overflow-hidden p-0",
        className,
      )}
      aria-busy={pending}
    >
      <h2 className="sr-only">
        Прохождение теста: {title}
        {moduleTitle ? `, модуль ${moduleTitle}` : ""}
      </h2>
      <header
        className={cn(
          "ce-test-taking-header sticky top-0 z-20 border-b border-border/60 bg-card/95 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4",
          "max-md:top-14",
        )}
      >
        <div className="ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
        <div className="relative min-w-0 space-y-3 max-md:space-y-2.5">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                {title}
              </p>
              {moduleTitle ? (
                <p className="truncate text-xs text-muted-foreground">{moduleTitle}</p>
              ) : null}
            </div>
            <span
              className="shrink-0 rounded-lg border border-primary/25 bg-primary/10 px-2 py-1 font-mono text-xs font-semibold tabular-nums text-primary md:hidden"
              aria-hidden
            >
              {idx + 1}/{total}
            </span>
            <p className="hidden shrink-0 text-xs text-muted-foreground md:block">
              Проходной: <span className="font-medium text-foreground">{minScore}</span> б. · макс.{" "}
              {maxScore}
            </p>
          </div>

          <TestTakingTimer timer={timer} timeExpiredNotice={timeExpiredNotice} />

          <div className="hidden min-w-0 space-y-3 md:block">
            <ProgressBar label={`Вопрос ${idx + 1} из ${total}`} value={idx + 1} max={total} />
            <ProgressBar
              label="Отвечено"
              value={answeredCount}
              max={total}
              tone={allAnswered ? "success" : "default"}
            />
            <p className="text-sm font-medium text-foreground tabular-nums" aria-live="polite">
              Вопрос {idx + 1} из {total}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                · заполнено {answeredCount}/{total} ({progressPct}%)
              </span>
            </p>
            <p
              className={cn(
                "rounded-lg border px-3 py-2 text-xs font-medium",
                allAnswered
                  ? "border-success/35 bg-success/10 text-success"
                  : "border-warning/35 bg-warning/8 text-amber-900 dark:text-amber-200",
              )}
              role="status"
            >
              {remainingLabel}
              {!allAnswered && unansweredIndexes.length > 0 && unansweredIndexes.length <= 8 ? (
                <span className="mt-1 block font-normal text-muted-foreground">
                  Без ответа:{" "}
                  <span className="font-mono tabular-nums text-foreground">{unansweredIndexes.join(", ")}</span>
                </span>
              ) : null}
            </p>
          </div>

          <div className="min-w-0 space-y-2 md:hidden">
            <ProgressBar
              label={`Вопрос ${idx + 1} из ${total} · отвечено ${answeredCount}`}
              value={answeredCount}
              max={total}
              tone={allAnswered ? "success" : "default"}
              labelTruncate={false}
            />
            <p
              className={cn(
                "text-xs font-medium leading-snug",
                allAnswered ? "text-success" : "text-foreground",
              )}
              role="status"
              aria-live="polite"
            >
              {remainingLabel}
            </p>
          </div>

          <QuestionNavigator
            className="min-w-0"
            total={total}
            currentIndex={idx}
            answeredFlags={answeredFlags}
            openedFlags={openedFlags}
            allowFreeNavigation={allowFreeNavigation}
            onSelect={onIndexChange}
            disabled={pending}
          />
        </div>
      </header>

      <div className="ce-test-taking-body min-w-0 space-y-6 px-4 py-5 pb-8 sm:px-6 sm:py-6 sm:pb-6">
        {pending ? <PendingBanner label="Проверка ответов на сервере…" /> : null}
        <fieldset
          disabled={pending}
          className="m-0 min-w-0 space-y-6 border-0 p-0"
          aria-labelledby={questionHeadingId}
          aria-describedby={fieldDescribedBy}
        >
          <legend className="sr-only">
            {`Вопрос ${idx + 1} из ${total}`}
          </legend>
          <FormFeedback id="test-form-error" message={error} />
          {error ? (
            <TestClientErrorBanner error={error} onRetrySubmit={onRetrySubmit} pending={pending} />
          ) : null}
          {draftNote ? (
            <p className="text-xs text-muted-foreground" role="note">
              Черновик ответов сохраняется в sessionStorage этой вкладки до отправки или выхода из теста.
            </p>
          ) : null}

          <div className="ce-glass rounded-2xl border border-border/60 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                {idx + 1} / {total}
              </span>
              <span className="text-xs text-muted-foreground">
                {typeLabel(q.questionType)} · {q.points} б.
              </span>
            </div>
            <h2
              id={questionHeadingId}
              className="mt-4 text-[1.0625rem] font-medium leading-[1.55] text-pretty text-foreground max-md:text-lg sm:text-xl"
            >
              {q.questionText}
            </h2>
            {q.manualTextGrading ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Ответ проверяется вручную и не входит в автоматический зачёт.
              </p>
            ) : null}
          </div>

          {q.questionType === "TEXT" ? (
            <Textarea
              label="Ваш ответ"
              value={local.text[q.id] ?? ""}
              onChange={(e) => onText(q.id, e.target.value)}
              rows={6}
              maxLength={8000}
              className="min-h-[140px] rounded-xl border-border bg-muted/20"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "test-form-error" : undefined}
            />
          ) : q.questionType === "MULTIPLE_CHOICE" || q.questionType === "MATCHING" ? (
            <ul className="space-y-3" role="group" aria-label={testAnswerOptionsLegend(idx + 1, total)}>
              {q.answers.map((a) => (
                <li key={a.id}>
                  <TestAnswerOption
                    id={`test-${q.id}-${a.id}`}
                    label={a.answerText}
                    mode="multi"
                    selected={local.multi[q.id]?.includes(a.id) ?? false}
                    onSelect={() => onMultiToggle(q.id, a.id)}
                    disabled={pending}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-3" role="radiogroup" aria-label={testAnswerOptionsLegend(idx + 1, total)}>
              {q.answers.map((a) => (
                <li key={a.id}>
                  <TestAnswerOption
                    id={`test-${q.id}-${a.id}`}
                    label={a.answerText}
                    mode="single"
                    selected={local.single[q.id] === a.id}
                    onSelect={() => onSingle(q.id, a.id)}
                    disabled={pending}
                  />
                </li>
              ))}
            </ul>
          )}

          {q.questionType !== "TEXT" && q.answers.length > 0 ? (
            <p className="sr-only md:not-sr-only md:text-xs md:text-muted-foreground" id={keyboardHintId}>
              {testKeyboardHints}
            </p>
          ) : null}
        </fieldset>

          <nav
            className="ce-test-sticky-actions flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
            aria-label="Навигация по вопросам"
          >
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-h-12 w-full touch-manipulation sm:w-auto"
              disabled={idx <= 0 || pending}
              onClick={() => onIndexChange(idx - 1)}
            >
              Назад
            </Button>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              {idx < total - 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="min-h-12 w-full touch-manipulation sm:w-auto"
                  disabled={pending}
                  onClick={() => onIndexChange(idx + 1)}
                >
                  Далее
                </Button>
              ) : null}
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="min-h-12 w-full touch-manipulation sm:w-auto"
                disabled={pending}
                onClick={onRequestFinish}
              >
                Отправить тест
              </Button>
            </div>
          </nav>
      </div>

      <TestSubmitConfirmation
        open={submitOpen}
        onOpenChange={onSubmitOpenChange}
        answeredCount={answeredCount}
        total={total}
        unansweredIndexes={unansweredIndexes}
        minScore={minScore}
        maxScore={maxScore}
        pending={pending}
        error={error}
        onConfirm={onConfirmSubmit}
      />
    </div>
  );
}
