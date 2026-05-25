"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  GraduationCap,
  Lock,
  Map,
} from "lucide-react";
import {
  buildLessonCompletionNextSteps,
  canShowLessonMarkComplete,
  isLessonCompletionLocked,
  lessonCompletionDescription,
  lessonCompletionHeadline,
  LESSON_COMPLETION_SUCCESS_DEFAULT,
  lessonStatusLabel,
  type LessonCompletionNextPreview,
} from "@/lib/lesson-completion-ui";
import {
  LESSON_COMPLETION_TEST_HINT_ID,
  lessonCompletionLockedHintId,
} from "@/lib/lesson-page-a11y";
import { resolveLessonClientErrorDisplay } from "@/lib/lesson-page-state";
import type { LessonLink, LessonStatus } from "@/types/lesson-view-model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<string, typeof BookOpen> = {
  "next-lesson": BookOpen,
  test: ClipboardCheck,
  practice: FlaskConical,
  course: Map,
};

export type LessonCompletionCardProps = {
  lessonStatus: LessonStatus;
  lessonCompleted: boolean;
  canMarkComplete: boolean;
  canAccessTest: boolean;
  canAccessPractice: boolean;
  courseTitle: string;
  courseHref?: string;
  moduleHref: string;
  nextLesson?: LessonLink | null;
  nextTest?: LessonLink | null;
  nextPractice?: LessonLink | null;
  hasTest: boolean;
  hasPractice: boolean;
  /** Server Action в родителе (`markLessonStudiedAction` + `router.refresh`). */
  markPending: boolean;
  error?: string | null;
  successMessage?: string | null;
  lockedReason?: string | null;
  onMarkComplete: () => void;
  className?: string;
};

function NextStepRow({ step }: { step: LessonCompletionNextPreview }) {
  const Icon = STEP_ICONS[step.id] ?? GraduationCap;
  return (
    <li
      className={cn(
        "flex gap-3 rounded-lg border px-3 py-2.5",
        step.available ? "border-border/80 bg-muted/15" : "border-dashed border-border/60 bg-muted/10 opacity-75",
      )}
    >
      <Icon
        className={cn("mt-0.5 size-4 shrink-0", step.available ? "text-primary" : "text-muted-foreground")}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{step.label}</p>
        <p className="text-xs text-muted-foreground">{step.description}</p>
        {!step.available ? (
          <p className="mt-1 text-[11px] text-muted-foreground">Откроется после завершения урока</p>
        ) : null}
      </div>
    </li>
  );
}

export function LessonCompletionCard({
  lessonStatus,
  lessonCompleted,
  canMarkComplete,
  canAccessTest,
  canAccessPractice,
  courseTitle,
  courseHref = "/dashboard/course",
  moduleHref,
  nextLesson,
  nextTest,
  nextPractice,
  hasTest,
  hasPractice,
  markPending,
  error,
  successMessage,
  lockedReason,
  onMarkComplete,
  className,
}: LessonCompletionCardProps) {
  const submitGuard = useRef(false);
  const isLocked = isLessonCompletionLocked(lessonStatus);
  const statusLabel = lessonStatusLabel(lessonStatus);
  const showMarkButton = canShowLessonMarkComplete({
    lessonStatus,
    lessonCompleted,
    canMarkComplete,
    markPending,
  });
  const showSuccessBanner = Boolean(lessonCompleted && (successMessage || !error));
  const successText = successMessage?.trim() || LESSON_COMPLETION_SUCCESS_DEFAULT;
  const saveError = error ? resolveLessonClientErrorDisplay(error) : null;
  const lockedHintId =
    isLocked && lockedReason?.trim() ? lessonCompletionLockedHintId() : undefined;

  const nextSteps = buildLessonCompletionNextSteps({
    courseTitle,
    nextLesson,
    nextTest,
    nextPractice,
    hasTest,
    hasPractice,
    canAccessTest,
    canAccessPractice,
    lessonCompleted,
    lessonStatus,
  });

  const testHref = nextTest?.href ?? `${moduleHref}/test`;
  const practiceHref = nextPractice?.href ?? `${moduleHref}/practice`;

  const handleMarkComplete = useCallback(() => {
    if (lessonCompleted || markPending || isLocked || !canMarkComplete) return;
    if (submitGuard.current) return;
    submitGuard.current = true;
    try {
      onMarkComplete();
    } finally {
      window.setTimeout(() => {
        submitGuard.current = false;
      }, 600);
    }
  }, [lessonCompleted, markPending, isLocked, canMarkComplete, onMarkComplete]);

  return (
    <section
      className={cn(
        "ce-lesson-completion-card scroll-mt-28 ce-glass rounded-2xl border p-5 sm:p-6",
        "shadow-[0_0_32px_-12px_hsl(var(--primary)/0.2)]",
        lessonCompleted
          ? "border-success/30"
          : isLocked
            ? "border-muted-foreground/25"
            : "border-primary/25",
        className,
      )}
      aria-labelledby="lesson-completion-card-heading"
    >
      <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={lessonCompleted ? "success" : isLocked ? "outline" : "primary"}
              className={cn(isLocked && "gap-1")}
            >
              {isLocked ? <Lock className="size-3 shrink-0" aria-hidden /> : null}
              {statusLabel}
            </Badge>
            {lessonCompleted ? (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="size-3.5" aria-hidden />
                Завершено
              </Badge>
            ) : null}
          </div>

          <div className="flex gap-4">
            <span
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-2xl border",
                lessonCompleted
                  ? "border-success/35 bg-success/10 text-success"
                  : isLocked
                    ? "border-muted-foreground/30 bg-muted/20 text-muted-foreground"
                    : "border-primary/25 bg-primary/10 text-primary",
              )}
              aria-hidden
            >
              {lessonCompleted ? (
                <CheckCircle2 className="size-6" strokeWidth={1.75} />
              ) : isLocked ? (
                <Lock className="size-5" strokeWidth={1.75} />
              ) : (
                <span className="size-2.5 rounded-full bg-primary" />
              )}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                Прогресс урока
              </p>
              <h2 id="lesson-completion-card-heading" className="mt-1 font-display text-xl font-semibold text-foreground">
                {lessonCompletionHeadline(lessonCompleted, lessonStatus)}
              </h2>
              <p className="mt-1 text-sm text-pretty text-muted-foreground">
                {lessonCompletionDescription(lessonCompleted, lessonStatus, lockedReason)}
              </p>
              {lockedHintId ? (
                <p id={lockedHintId} className="sr-only">
                  Причина блокировки: {lockedReason}
                </p>
              ) : null}
            </div>
          </div>

          {showSuccessBanner ? (
            <div
              className="rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-foreground"
              role="status"
              aria-live="polite"
            >
              <span className="inline-flex items-center gap-1.5 font-medium text-success">
                <CheckCircle2 className="size-4" aria-hidden />
                Успешно
              </span>
              <p className="mt-1 text-pretty">{successText}</p>
            </div>
          ) : null}

          {saveError ? (
            <div
              className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger"
              role="alert"
              aria-live="assertive"
            >
              <p className="font-medium">
                {saveError.kind === "access"
                  ? "Нет доступа"
                  : saveError.kind === "progress_save"
                    ? "Не удалось сохранить прогресс"
                    : "Не удалось завершить урок"}
              </p>
              <p className="mt-1 text-pretty">{saveError.message}</p>
            </div>
          ) : null}

          {markPending ? (
            <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
              Сохраняем прогресс на сервере…
            </p>
          ) : null}

          <div>
            <h3 className="text-sm font-semibold text-foreground">Что дальше</h3>
            <ul className="mt-3 space-y-2" aria-label="Следующие шаги обучения">
              {nextSteps.map((step) => (
                <NextStepRow key={step.id} step={step} />
              ))}
            </ul>
          </div>
        </div>

        <div className="flex w-full min-w-0 shrink-0 flex-col gap-2 lg:w-64">
          {hasTest && !canAccessTest ? (
            <p id={LESSON_COMPLETION_TEST_HINT_ID} className="sr-only">
              Сначала завершите урок, чтобы открыть тест модуля.
            </p>
          ) : null}
          {showMarkButton ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="min-h-12 w-full touch-manipulation"
              loading={markPending}
              disabled={markPending || isLocked}
              aria-busy={markPending}
              onClick={handleMarkComplete}
            >
              Завершить урок
            </Button>
          ) : null}

          {canMarkComplete && !lessonCompleted && isLocked ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="min-h-12 w-full"
              disabled
              aria-describedby={lockedHintId}
            >
              Завершить урок
            </Button>
          ) : null}

          {lessonCompleted && nextLesson && !nextLesson.disabled ? (
            <Button asChild variant="primary" size="lg" className="min-h-12 w-full gap-2">
              <Link href={nextLesson.href}>
                Перейти к следующему уроку
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          ) : null}

          {hasTest ? (
            <Button
              asChild={canAccessTest && !isLocked}
              variant={lessonCompleted && canAccessTest ? "primary" : "outline"}
              size="lg"
              className="min-h-12 w-full gap-2"
              disabled={!canAccessTest || isLocked}
              aria-describedby={
                isLocked && lockedHintId
                  ? lockedHintId
                  : !canAccessTest
                    ? LESSON_COMPLETION_TEST_HINT_ID
                    : undefined
              }
            >
              {canAccessTest && !isLocked ? (
                <Link href={testHref}>
                  Перейти к тесту
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Перейти к тесту
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              )}
            </Button>
          ) : null}

          {hasPractice && lessonCompleted && canAccessPractice && !isLocked ? (
            <Button asChild variant="outline" size="lg" className="min-h-12 w-full gap-2">
              <Link href={practiceHref}>
                К практике
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          ) : null}

          <Button asChild variant="outline" size="lg" className="min-h-12 w-full">
            <Link href={courseHref}>Вернуться к курсу</Link>
          </Button>

          <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground">
            <Link href={moduleHref}>Обзор модуля</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
