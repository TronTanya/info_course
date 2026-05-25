"use client";

import { Clock, ListChecks, Target, ArrowRight } from "lucide-react";
import type { ClientTestQuestion } from "@/lib/test-grading";
import {
  formatPassingScore,
  formatTestDuration,
  getTestCardStatus,
  testAfterSubmitSteps,
  testDifficultyLabel,
  testSessionRules,
  testStatusMeta,
  type TestCardStatus,
} from "@/lib/test-ui";
import { TEST_INTRO_CTA, buildTestIntroDescription, formatTestAttemptHistory } from "@/lib/test-flow";
import { TestModulePathStrip, type TestModulePathStep } from "@/components/test/test-module-path-strip";
import { TestQuestionTypeBreakdown } from "@/components/test/test-question-type-breakdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

export type TestStartScreenProps = {
  title: string;
  moduleTitle: string;
  moduleOrderNumber: number;
  moduleDescription?: string | null;
  questionCount: number;
  attemptCount?: number;
  estimatedMinutes: number;
  minScore: number;
  maxScore: number;
  lastAttempt: { percent: number; passed: boolean; score: number; maxScore: number } | null;
  questions?: Pick<ClientTestQuestion, "questionType">[];
  modulePathSteps?: TestModulePathStep[];
  onStart: () => void;
  disabled?: boolean;
};

export function TestStartScreen({
  title,
  moduleTitle,
  moduleOrderNumber,
  moduleDescription = null,
  questionCount,
  estimatedMinutes,
  minScore,
  maxScore,
  attemptCount = 0,
  lastAttempt,
  questions = [],
  modulePathSteps = [],
  onStart,
  disabled,
}: TestStartScreenProps) {
  const status: TestCardStatus = getTestCardStatus(lastAttempt);
  const meta = testStatusMeta[status];
  const difficulty = testDifficultyLabel(moduleOrderNumber);
  const bestPercent = lastAttempt?.percent ?? null;
  const hasTimeEstimate = estimatedMinutes > 0;
  const introDescription = buildTestIntroDescription({
    moduleTitle,
    moduleDescription,
    questionCount,
  });
  const attemptLabel = formatTestAttemptHistory(attemptCount);

  return (
    <article className={cn("ce-test-intro ce-test-card overflow-hidden", cyber.panel, "card-gradient")}>
      <div className="space-y-6 p-5 sm:p-7">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className={cyber.monoLabel}>Тест модуля</p>
            <h2 className="font-display text-xl font-semibold text-balance text-foreground sm:text-2xl">{title}</h2>
            <p className="text-sm font-medium text-muted-foreground">
              Модуль {moduleOrderNumber}: {moduleTitle}
            </p>
          </div>
          <Badge className={cn("w-fit shrink-0 font-mono text-[10px] uppercase tracking-wider", meta.className)}>
            {meta.label}
          </Badge>
        </header>

        {modulePathSteps.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Место в модуле</p>
            <TestModulePathStrip steps={modulePathSteps} />
          </div>
        ) : null}

        <dl className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-4">
          <Stat icon={ListChecks} label="Вопросов" value={String(questionCount)} />
          <Stat
            icon={Clock}
            label={hasTimeEstimate ? "Ориентир времени" : "Лимит времени"}
            value={hasTimeEstimate ? formatTestDuration(estimatedMinutes) : "Без ограничения"}
          />
          <Stat icon={Target} label="Проходной балл" value={formatPassingScore(minScore, maxScore)} />
          <Stat label="Сложность" value={difficulty} />
        </dl>

        <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{introDescription}</p>

        {attemptLabel || bestPercent != null ? (
          <p className="text-sm text-muted-foreground" role="status">
            {attemptLabel}
            {attemptLabel && bestPercent != null ? " · " : null}
            {bestPercent != null ? (
              <>
                лучший результат:{" "}
                <span className="font-semibold tabular-nums text-foreground">{bestPercent}%</span>
                {lastAttempt ? ` (${lastAttempt.score} / ${lastAttempt.maxScore} б.)` : ""}
              </>
            ) : null}
          </p>
        ) : null}

        {questions.length > 0 ? (
          <TestQuestionTypeBreakdown questions={questions} />
        ) : null}

        <SectionCard variant="default" flushTitle className="p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground">Правила прохождения</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {testSessionRules.map((line) => (
              <li key={line} className="flex gap-2 text-pretty">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard variant="muted" flushTitle className="p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">После отправки</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {testAfterSubmitSteps.map((line) => (
              <li key={line} className="flex gap-2">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                <span className="text-pretty">{line}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <Button
          type="button"
          variant="primary"
          size="lg"
          className="min-h-12 w-full touch-manipulation sm:w-auto"
          disabled={disabled}
          onClick={onStart}
        >
          {status === "passed" ? "Пройти снова" : TEST_INTRO_CTA}
        </Button>
      </div>
    </article>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof ListChecks;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5">
      {Icon ? <Icon className="mb-1 size-4 text-primary" aria-hidden /> : null}
      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold leading-snug text-foreground">{value}</dd>
    </div>
  );
}
