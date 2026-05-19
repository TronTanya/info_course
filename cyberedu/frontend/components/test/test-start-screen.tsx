"use client";

import { Clock, ListChecks, Target, ArrowRight } from "lucide-react";
import {
  formatPassingScore,
  formatTestDuration,
  getTestCardStatus,
  testAfterSubmitSteps,
  testDifficultyLabel,
  testStatusMeta,
  type TestCardStatus,
} from "@/lib/test-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

export type TestStartScreenProps = {
  title: string;
  moduleTitle: string;
  moduleOrderNumber: number;
  questionCount: number;
  estimatedMinutes: number;
  minScore: number;
  maxScore: number;
  lastAttempt: { percent: number; passed: boolean; score: number; maxScore: number } | null;
  onStart: () => void;
  disabled?: boolean;
};

export function TestStartScreen({
  title,
  moduleTitle,
  moduleOrderNumber,
  questionCount,
  estimatedMinutes,
  minScore,
  maxScore,
  lastAttempt,
  onStart,
  disabled,
}: TestStartScreenProps) {
  const status: TestCardStatus = getTestCardStatus(lastAttempt);
  const meta = testStatusMeta[status];
  const difficulty = testDifficultyLabel(moduleOrderNumber);
  const bestPercent = lastAttempt?.percent ?? null;
  const hasTimeEstimate = estimatedMinutes > 0;

  return (
    <article className={cn("ce-test-card overflow-hidden", cyber.panel, "card-gradient")}>
      <div className="space-y-6 p-5 sm:p-7">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className={cyber.monoLabel}>Перед началом</p>
            <h2 className="font-display text-xl font-semibold text-balance text-foreground sm:text-2xl">{title}</h2>
            <p className="text-sm text-muted-foreground">{moduleTitle}</p>
          </div>
          <Badge className={cn("w-fit shrink-0 font-mono text-[10px] uppercase tracking-wider", meta.className)}>
            {meta.label}
          </Badge>
        </header>

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

        {bestPercent != null ? (
          <p className="text-sm text-muted-foreground">
            Лучший результат: <span className="font-semibold tabular-nums text-foreground">{bestPercent}%</span>
            {lastAttempt ? ` (${lastAttempt.score} / ${lastAttempt.maxScore} б.)` : ""}
          </p>
        ) : null}

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

        <p className="text-xs text-muted-foreground">
          Ответы сохраняются в браузере во время прохождения. Перед отправкой вы увидите предупреждение и сможете вернуться к
          вопросам.
        </p>

        <Button type="button" variant="primary" size="lg" className="w-full sm:w-auto" disabled={disabled} onClick={onStart}>
          {status === "passed" ? "Пройти снова" : "Начать тест"}
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
