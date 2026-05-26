"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatTestDuration,
  getTestCardStatus,
  testDifficultyLabel,
  testStatusMeta,
  type TestCardStatus,
} from "@/lib/test-ui";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

export type TestListCardProps = {
  title: string;
  moduleTitle: string;
  moduleOrderNumber: number;
  questionCount: number;
  estimatedMinutes: number;
  minScore: number;
  lastAttempt: { percent: number; passed: boolean; score: number; maxScore: number } | null;
  onStart: () => void;
  disabled?: boolean;
};

export function TestListCard({
  title,
  moduleTitle,
  moduleOrderNumber,
  questionCount,
  estimatedMinutes,
  minScore,
  lastAttempt,
  onStart,
  disabled,
}: TestListCardProps) {
  const status: TestCardStatus = getTestCardStatus(lastAttempt);
  const meta = testStatusMeta[status];
  const difficulty = testDifficultyLabel(moduleOrderNumber);
  const bestPercent = lastAttempt?.percent ?? null;

  return (
    <article className={cn("ce-test-card group relative overflow-hidden p-5 sm:p-6", cyber.panel, "card-gradient")}>
      <div className="relative space-y-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className={cyber.monoLabel}>Контроль знаний</p>
            <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">{title}</h2>
            <p className="text-sm text-muted-foreground">{moduleTitle}</p>
          </div>
          <Badge className={cn("w-fit shrink-0 font-mono text-2.5 uppercase tracking-wider", meta.className)}>
            {meta.label}
          </Badge>
        </header>

        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
            <dt className="text-2.5 font-medium uppercase tracking-wide text-muted-foreground">Вопросов</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-foreground">{questionCount}</dd>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
            <dt className="text-2.5 font-medium uppercase tracking-wide text-muted-foreground">Время</dt>
            <dd className="mt-0.5 font-semibold text-foreground">{formatTestDuration(estimatedMinutes)}</dd>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
            <dt className="text-2.5 font-medium uppercase tracking-wide text-muted-foreground">Сложность</dt>
            <dd className="mt-0.5 font-medium text-foreground">{difficulty}</dd>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
            <dt className="text-2.5 font-medium uppercase tracking-wide text-muted-foreground">Лучший результат</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
              {bestPercent != null ? `${bestPercent}%` : "—"}
            </dd>
          </div>
        </dl>

        <p className="text-xs text-muted-foreground">
          Проходной балл: <span className="font-medium text-foreground">{minScore}</span> (автоматически оцениваемые вопросы).
        </p>

        <Button type="button" variant="primary" size="lg" className="w-full sm:w-auto" disabled={disabled} onClick={onStart}>
          {status === "passed" ? "Пройти снова" : "Начать тест"}
        </Button>
      </div>
    </article>
  );
}
