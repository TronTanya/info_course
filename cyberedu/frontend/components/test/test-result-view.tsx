"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { AnswerFeedback } from "@/components/ui/answer-feedback";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { SuccessState } from "@/components/ui/success-state";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { SectionCard } from "@/components/ui/section-card";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

export type TestReviewRow = {
  questionId: string;
  questionText: string;
  explanation: string | null;
  isCorrect: boolean | null;
  pointsEarned: number;
  maxPoints: number;
};

export function TestResultView({
  moduleId,
  title,
  score,
  maxScore,
  percent,
  passed,
  correctCount,
  totalGraded,
  review,
  onRetry,
}: {
  moduleId: string;
  title: string;
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean;
  correctCount: number;
  totalGraded: number;
  review: TestReviewRow[];
  onRetry: () => void;
}) {
  const weakTopics = review.filter((r) => r.isCorrect === false);
  const pendingManual = review.filter((r) => r.isCorrect === null);

  return (
    <div className="ce-test-result space-y-6">
      <CyberHero className="ce-test-result-hero border-primary/25" padding="default">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <p className={cyber.monoLabel}>Результат теста</p>
            <h2 className="text-center font-display text-xl font-semibold text-foreground sm:text-left">{title}</h2>
            <p className={cn("text-sm font-medium", passed ? "text-success" : "text-danger")}>
              {passed ? "Тест пройден" : "Тест не пройден"}
            </p>
          </div>
          <CircularProgress
            value={percent}
            size={120}
            strokeWidth={8}
            label={`${percent}%`}
            tone={passed ? "success" : "default"}
          />
        </div>
        <dl className="ce-test-result-stats relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-center sm:text-left">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Правильно</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {correctCount} / {totalGraded}
            </dd>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-center sm:text-left">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Баллы</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {score} / {maxScore}
            </dd>
          </div>
          <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-center sm:text-left">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Процент</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">{percent}%</dd>
          </div>
        </dl>
      </CyberHero>

      {passed ? (
        <SuccessState
          compact
          title="Тест успешно пройден"
          description="Можно переходить к практической лаборатории модуля или повторить тест для закрепления."
        />
      ) : null}

      {weakTopics.length > 0 ? (
        <section className="space-y-4 rounded-2xl border border-danger/25 bg-danger/[0.04] p-5 ring-1 ring-danger/15 sm:p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
            <AlertTriangle className="size-4 text-danger" aria-hidden />
            Разбор ошибок
          </h3>
          <ul className="space-y-3">
            {weakTopics.map((row) => (
              <li key={row.questionId}>
                <AnswerFeedback
                  variant="incorrect"
                  title={row.questionText}
                  explanation={row.explanation}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <SectionCard variant="lab" title="Рекомендации" flushTitle>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {passed ? (
            <>
              <li className="flex gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                Закрепите материал в практической лаборатории модуля.
              </li>
              <li>При желании пройдите тест повторно для закрепления.</li>
            </>
          ) : (
            <>
              <li>Повторите лекцию модуля и ключевые определения.</li>
              <li>Обратите внимание на вопросы из блока «Слабые темы».</li>
              <li>Пройдите тест ещё раз после повторения.</li>
            </>
          )}
          {pendingManual.length > 0 ? (
            <li className="text-warning">
              {pendingManual.length} ответ(ов) ожидают ручной проверки и не влияют на автоматический зачёт.
            </li>
          ) : null}
        </ul>
        {review.filter((r) => r.isCorrect === true && r.explanation).length > 0 ? (
          <details className="mt-4 rounded-xl border border-border/60 bg-muted/20 p-3">
            <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-foreground">
              Пояснения к верным ответам
            </summary>
            <ul className="mt-3 max-h-64 space-y-3 overflow-y-auto">
              {review
                .filter((r) => r.isCorrect === true && r.explanation)
                .map((row) => (
                  <li key={row.questionId}>
                    <AnswerFeedback variant="correct" title={row.questionText} explanation={row.explanation} />
                  </li>
                ))}
            </ul>
          </details>
        ) : null}
      </SectionCard>

      <div className="flex flex-col gap-3">
        <Button type="button" variant="primary" size="lg" className="w-full" onClick={onRetry}>
          Повторить тест
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href={`/dashboard/course/${moduleId}`}>Вернуться к модулю</Link>
        </Button>
        <Button asChild variant={passed ? "primary" : "secondary"} size="lg" className="w-full">
          <Link href={`/dashboard/course/${moduleId}/practice`}>Перейти к практике</Link>
        </Button>
      </div>
    </div>
  );
}
