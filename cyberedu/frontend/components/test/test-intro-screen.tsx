"use client";

import Link from "next/link";
import { createElement } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FlaskConical,
  LayoutGrid,
  ListChecks,
  Lock,
  MessageSquareOff,
  RotateCcw,
  Server,
  Target,
} from "lucide-react";
import type { ClientTestQuestion } from "@/lib/test-grading";
import {
  buildTestIntroDescriptionText,
  buildTestIntroRules,
  formatPassingScore,
  formatTestAttemptsLine,
  formatTestDuration,
  testIntroBreadcrumbs,
  type TestIntroScreenState,
} from "@/lib/test-intro";
import { TEST_INTRO_CTA } from "@/lib/test-flow";
import { TEST_ATTEMPTS_EXHAUSTED_MESSAGE } from "@/lib/test-retry";
import { TestModulePathStrip, type TestModulePathStep } from "@/components/test/test-module-path-strip";
import { TestQuestionTypeBreakdown } from "@/components/test/test-question-type-breakdown";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorCard } from "@/components/ui/error-card";
import { LoadingState } from "@/components/ui/loading-state";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

export type { TestIntroScreenState } from "@/lib/test-intro";

export type TestIntroScreenProps = {
  moduleId: string;
  testTitle: string;
  moduleTitle: string;
  moduleOrderNumber: number;
  moduleDescription?: string | null;
  testDescription?: string | null;
  questionCount: number;
  minScore: number;
  maxScore: number;
  estimatedMinutes: number;
  attemptCount?: number;
  /** null / undefined — без лимита попыток */
  maxAttempts?: number | null;
  /** Жёсткий лимит времени в минутах; null — только ориентир */
  timeLimitMinutes?: number | null;
  allowEditAfterSubmit?: boolean;
  state?: TestIntroScreenState;
  lockReason?: string;
  errorMessage?: string;
  onRetry?: () => void;
  lastAttempt?: { percent: number; passed: boolean; score: number; maxScore: number } | null;
  questions?: Pick<ClientTestQuestion, "questionType">[];
  modulePathSteps?: TestModulePathStep[];
  onStart?: () => void;
  disabled?: boolean;
  className?: string;
};

const STATE_BADGE: Record<
  Exclude<TestIntroScreenState, "loading" | "error">,
  { label: string; className: string }
> = {
  locked: { label: "Недоступно", className: "border-warning/40 bg-warning/10 text-warning" },
  attempts_exhausted: { label: "Попытки исчерпаны", className: "border-danger/35 bg-danger/12 text-danger" },
  already_passed: { label: "Зачёт получен", className: "border-success/35 bg-success/12 text-success" },
  ready: { label: "Готов к запуску", className: "border-primary/35 bg-primary/12 text-primary" },
};

export function TestIntroScreen({
  moduleId,
  testTitle,
  moduleTitle,
  moduleOrderNumber,
  moduleDescription = null,
  testDescription = null,
  questionCount,
  minScore,
  maxScore,
  estimatedMinutes,
  attemptCount = 0,
  maxAttempts = null,
  timeLimitMinutes = null,
  allowEditAfterSubmit = false,
  state = "ready",
  lockReason,
  errorMessage,
  onRetry,
  lastAttempt = null,
  questions = [],
  modulePathSteps = [],
  onStart,
  disabled,
  className,
}: TestIntroScreenProps) {
  const lessonHref = `/dashboard/course/${moduleId}/lesson`;
  const courseHref = `/dashboard/course/${moduleId}`;
  const practiceHref = `/dashboard/course/${moduleId}/practice`;
  const breadcrumbs = testIntroBreadcrumbs(moduleId, moduleTitle, testTitle);
  const description = buildTestIntroDescriptionText({
    moduleTitle,
    moduleDescription,
    questionCount,
    testDescription,
  });
  const rules = buildTestIntroRules({
    timeLimitMinutes: timeLimitMinutes ?? null,
    estimatedMinutes,
    allowEditAfterSubmit,
  });
  const attemptsLine = formatTestAttemptsLine(attemptCount, maxAttempts);
  const timeLabel =
    timeLimitMinutes != null && timeLimitMinutes > 0
      ? "Лимит времени"
      : estimatedMinutes > 0
        ? "Ориентир времени"
        : "Время";
  const timeValue =
    timeLimitMinutes != null && timeLimitMinutes > 0
      ? formatTestDuration(timeLimitMinutes)
      : estimatedMinutes > 0
        ? formatTestDuration(estimatedMinutes)
        : "Без ограничения";

  if (state === "loading") {
    return (
      <div className={cn("ce-test-intro-screen", className)}>
        <LoadingState label="Подготовка теста…" terminalLine="assessment --init" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={cn("ce-test-intro-screen flex min-h-[20rem] items-center justify-center p-4", className)}>
        <ErrorCard
          title="Не удалось загрузить тест"
          description={errorMessage ?? "Попробуйте обновить страницу или вернитесь к курсу."}
          className="max-w-lg w-full"
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              {onRetry ? (
                <Button type="button" variant="primary" onClick={onRetry}>
                  <RotateCcw className="size-4" aria-hidden />
                  Повторить
                </Button>
              ) : null}
              <TestIntroNavLinks lessonHref={lessonHref} courseHref={courseHref} moduleOnly />
            </div>
          }
        />
      </div>
    );
  }

  const viewState = state as Exclude<TestIntroScreenState, "loading" | "error">;
  const canStart =
    (viewState === "ready" || viewState === "already_passed") && !disabled && questionCount > 0;
  const badge = STATE_BADGE[viewState];

  return (
    <article
      className={cn(
        "ce-test-intro-screen ce-test-intro relative isolate min-w-0 overflow-hidden",
        cyber.panel,
        "card-gradient",
        className,
      )}
    >
      <div className="ce-tech-grid pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden />
      <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/12 blur-3xl" aria-hidden />

      <div className="relative space-y-6 p-5 sm:p-7 lg:p-8">
        <Breadcrumbs items={breadcrumbs} compact className="text-xs sm:text-sm" />

        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className={cyber.monoLabel}>
              <ClipboardCheck className="mr-1.5 inline size-3.5 align-text-bottom" aria-hidden />
              Контроль знаний
            </p>
            <h2 className="font-display text-2xl font-semibold text-balance text-foreground sm:text-3xl">{testTitle}</h2>
            <p className="text-sm font-medium text-muted-foreground">
              Модуль {moduleOrderNumber}: {moduleTitle}
            </p>
            <p className="max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">{description}</p>
          </div>
          {badge ? (
            <Badge className={cn("h-fit w-fit shrink-0 font-mono text-[10px] uppercase tracking-wider", badge.className)}>
              {badge.label}
            </Badge>
          ) : null}
        </header>

        {viewState === "locked" ? (
          <IntroAlert
            icon={Lock}
            tone="warning"
            title="Тест пока недоступен"
            description={lockReason ?? "Сначала выполните предыдущие шаги модуля."}
          />
        ) : null}

        {viewState === "attempts_exhausted" ? (
          <IntroAlert
            icon={AlertTriangle}
            tone="danger"
            title="Попытки закончились"
            description={attemptsLine ?? TEST_ATTEMPTS_EXHAUSTED_MESSAGE}
          />
        ) : null}

        {viewState === "already_passed" ? (
          <IntroAlert
            icon={CheckCircle2}
            tone="success"
            title="Тест уже пройден"
            description={
              lastAttempt
                ? `Ваш лучший результат: ${lastAttempt.percent}% (${lastAttempt.score} / ${lastAttempt.maxScore} б.). Можно закрепить материал в практике или пройти тест снова.`
                : "Зачёт засчитан — переходите к практике модуля или пройдите тест повторно для закрепления."
            }
          />
        ) : null}

        {modulePathSteps.length > 0 ? (
          <div className="ce-glass rounded-2xl border border-border/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Место в модуле</p>
            <div className="mt-3">
              <TestModulePathStrip steps={modulePathSteps} />
            </div>
          </div>
        ) : null}

        <dl className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 lg:grid-cols-4">
          <MetricTile icon={ListChecks} label="Вопросов" value={String(questionCount)} />
          <MetricTile icon={Target} label="Проходной балл" value={formatPassingScore(minScore, maxScore)} />
          <MetricTile icon={Clock} label={timeLabel} value={timeValue} />
          <MetricTile
            icon={ClipboardCheck}
            label="Попытки"
            value={
              maxAttempts != null && maxAttempts > 0
                ? `${attemptCount} / ${maxAttempts}`
                : attemptCount > 0
                  ? String(attemptCount)
                  : "Без лимита"
            }
          />
        </dl>

        {attemptsLine && viewState !== "attempts_exhausted" ? (
          <p className="text-sm text-muted-foreground" role="status">
            {attemptsLine}
          </p>
        ) : null}

        {questions.length > 0 ? (
          <div className="ce-glass rounded-2xl border border-border/60 p-4 sm:p-5">
            <TestQuestionTypeBreakdown questions={questions} />
          </div>
        ) : null}

        <section
          className="ce-glass ce-test-intro-rules rounded-2xl border border-primary/20 bg-primary/[0.03] p-4 sm:p-6"
          aria-labelledby="test-intro-rules-heading"
        >
          <h2 id="test-intro-rules-heading" className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
            <Server className="size-4 text-primary" aria-hidden />
            Правила теста
          </h2>
          <ul className="mt-4 space-y-3" role="list">
            {rules.map((line) => (
              <li key={line} className="flex gap-3 text-sm text-pretty text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {line}
              </li>
            ))}
            <li className="flex gap-3 text-sm text-pretty text-muted-foreground">
              <MessageSquareOff className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden />
              <span>
                Во время теста наставник подсказывает по теме, но{" "}
                <strong className="font-medium text-foreground">не выдаёт готовые ответы</strong> на вопросы зачёта.
              </span>
            </li>
          </ul>
        </section>

        <footer className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:flex-wrap sm:items-center">
          {viewState === "already_passed" ? (
            <Button asChild variant="primary" size="lg" className="min-h-12 w-full touch-manipulation sm:w-auto">
              <Link href={practiceHref}>
                <FlaskConical className="size-4" aria-hidden />
                Перейти к практике
              </Link>
            </Button>
          ) : null}
          {canStart ? (
            <Button
              type="button"
              variant={viewState === "already_passed" ? "outline" : "primary"}
              size="lg"
              className="min-h-12 w-full touch-manipulation sm:min-w-[12rem]"
              disabled={disabled}
              onClick={onStart}
            >
              {viewState === "already_passed" ? "Пройти снова" : TEST_INTRO_CTA}
            </Button>
          ) : null}
          {viewState !== "locked" && viewState !== "attempts_exhausted" && !canStart && questionCount === 0 ? (
            <p className="text-sm text-muted-foreground">Вопросы теста ещё не добавлены.</p>
          ) : null}
          <TestIntroNavLinks
            lessonHref={lessonHref}
            courseHref={courseHref}
            showLesson={viewState !== "locked"}
            layout="inline"
          />
        </footer>
      </div>
    </article>
  );
}

function IntroAlert({
  icon,
  tone,
  title,
  description,
}: {
  icon: typeof Lock;
  tone: "warning" | "danger" | "success";
  title: string;
  description: string;
}) {
  const toneClass =
    tone === "success"
      ? "border-success/30 bg-success/[0.06] text-success"
      : tone === "danger"
        ? "border-danger/30 bg-danger/[0.06] text-danger"
        : "border-warning/30 bg-warning/[0.06] text-warning";

  return (
    <div className={cn("ce-glass flex gap-3 rounded-2xl border p-4 sm:p-5", toneClass)} role="alert">
      {createElement(icon, { className: "size-5 shrink-0", "aria-hidden": true })}
      <div className="min-w-0">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-pretty text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
}: {
  icon: typeof ListChecks;
  label: string;
  value: string;
}) {
  return (
    <div className="ce-glass rounded-xl border border-border/70 bg-muted/15 px-3 py-3 sm:px-4 sm:py-3.5">
      {createElement(icon, { className: "mb-1.5 size-4 text-primary", "aria-hidden": true })}
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold leading-snug text-foreground tabular-nums">{value}</dd>
    </div>
  );
}

function TestIntroNavLinks({
  lessonHref,
  courseHref,
  showLesson = true,
  layout = "stack",
  moduleOnly = false,
}: {
  lessonHref: string;
  courseHref: string;
  showLesson?: boolean;
  layout?: "stack" | "inline";
  moduleOnly?: boolean;
}) {
  const wrap = layout === "inline" ? "flex flex-wrap gap-2 sm:ml-auto" : "flex flex-col gap-2 sm:flex-row";

  if (moduleOnly) {
    return (
      <Button asChild variant="outline" size="md">
        <Link href={courseHref}>
          <LayoutGrid className="size-4" aria-hidden />
          Вернуться к курсу
        </Link>
      </Button>
    );
  }

  return (
    <div className={wrap}>
      {showLesson ? (
        <Button asChild variant="outline" size="lg" className="min-h-12 w-full touch-manipulation sm:w-auto">
          <Link href={lessonHref}>
            <BookOpen className="size-4" aria-hidden />
            Вернуться к уроку
          </Link>
        </Button>
      ) : null}
      <Button asChild variant="ghost" size="lg" className="min-h-12 w-full touch-manipulation sm:w-auto">
        <Link href={courseHref}>
          <LayoutGrid className="size-4" aria-hidden />
          Вернуться к курсу
        </Link>
      </Button>
    </div>
  );
}
