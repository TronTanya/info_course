"use client";

import type { ClientTestQuestion } from "@/lib/test-grading";
import type { QuestionType } from "@prisma/client";
import { TestAnswerOption } from "@/components/test/test-answer-option";
import { TestQuestionNav } from "@/components/test/test-question-nav";
import { TestSubmitDialog } from "@/components/test/test-submit-dialog";
import { Button } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import { PendingBanner } from "@/components/ui/pending-banner";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Textarea } from "@/components/ui/textarea";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

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

export type TestLocalAnswers = {
  single: Record<string, string | null>;
  multi: Record<string, string[]>;
  text: Record<string, string>;
};

export function TestTakingView({
  title,
  minScore,
  maxScore,
  questions,
  idx,
  local,
  error,
  pending,
  answeredCount,
  answeredFlags,
  submitOpen,
  onSubmitOpenChange,
  onIndexChange,
  onSingle,
  onMultiToggle,
  onText,
  onRequestFinish,
  onConfirmSubmit,
  draftNote,
}: {
  title: string;
  minScore: number;
  maxScore: number;
  questions: ClientTestQuestion[];
  idx: number;
  local: TestLocalAnswers;
  error: string | null;
  pending: boolean;
  answeredCount: number;
  answeredFlags: boolean[];
  submitOpen: boolean;
  onSubmitOpenChange: (open: boolean) => void;
  onIndexChange: (next: number) => void;
  onSingle: (qid: string, aid: string) => void;
  onMultiToggle: (qid: string, aid: string) => void;
  onText: (qid: string, text: string) => void;
  onRequestFinish: () => void;
  onConfirmSubmit: () => void;
  draftNote?: boolean;
}) {
  const total = questions.length;
  const q = questions[idx];
  if (!q) return null;

  const progressPct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  const unansweredIndexes = questions
    .map((qq, i) => (!answeredFlags[i] ? i + 1 : null))
    .filter((n): n is number => n != null);

  return (
    <div className={cn("ce-test-taking ce-immersive-mobile-pad", cyber.panel, "card-gradient min-w-0 space-y-0 overflow-hidden p-0")}>
      <header
        className={cn(
          "sticky top-0 z-20 border-b border-border/60 bg-card/95 px-4 py-4 backdrop-blur-sm sm:px-6",
          "max-md:top-14",
        )}
      >
        <div className="ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
        <div className="relative space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{title}</p>
            <p className="text-xs text-muted-foreground">
              Проходной: <span className="font-medium text-foreground">{minScore}</span> б.
            </p>
          </div>
          <ProgressBar label={`Вопрос ${idx + 1} из ${total}`} value={idx + 1} max={total} />
          <ProgressBar
            label="Отвечено"
            value={answeredCount}
            max={total}
            tone={answeredCount === total ? "success" : "default"}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Заполнено <span className="font-semibold tabular-nums text-foreground">{answeredCount}</span> / {total}
            </span>
            <span className="tabular-nums">{progressPct}%</span>
          </div>
          <TestQuestionNav
            total={total}
            currentIndex={idx}
            answeredFlags={answeredFlags}
            onSelect={onIndexChange}
            disabled={pending}
          />
        </div>
      </header>

      <div className="space-y-6 px-4 py-6 sm:px-6">
        {pending ? <PendingBanner label="Проверка ответов на сервере…" /> : null}
        <fieldset disabled={pending} className="m-0 min-w-0 space-y-6 border-0 p-0">
          <FormFeedback id="test-form-error" message={error} />
          {draftNote ? (
            <p className="text-xs text-muted-foreground" role="note">
              Ответы сохраняются автоматически в этом браузере — можно переключаться между вопросами.
            </p>
          ) : null}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                {idx + 1} / {total}
              </span>
              <span className="text-xs text-muted-foreground">
                {typeLabel(q.questionType)} · {q.points} б.
              </span>
            </div>
            <h2 className="mt-4 text-lg font-medium leading-relaxed text-pretty text-foreground sm:text-xl">{q.questionText}</h2>
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
            <ul className="space-y-3" role="group" aria-label="Варианты ответа">
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
            <ul className="space-y-3" role="radiogroup" aria-label="Варианты ответа">
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

          <nav className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
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
                  className="w-full sm:w-auto"
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
                className="w-full sm:w-auto"
                disabled={pending}
                onClick={onRequestFinish}
              >
                Завершить тест
              </Button>
            </div>
          </nav>
        </fieldset>
      </div>

      <TestSubmitDialog
        open={submitOpen}
        onOpenChange={onSubmitOpenChange}
        answeredCount={answeredCount}
        total={total}
        unansweredIndexes={unansweredIndexes}
        minScore={minScore}
        maxScore={maxScore}
        pending={pending}
        onConfirm={onConfirmSubmit}
      />
    </div>
  );
}
