"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, FlaskConical, MessageSquare, RotateCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { SuccessState } from "@/components/ui/success-state";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { SectionCard } from "@/components/ui/section-card";
import { cyber } from "@/lib/design-system/cyber";
import type { TestReviewRow } from "@/lib/test-result-insights";
import { TEST_RESULT_CTA } from "@/lib/test-flow";
import { buildTestResultInsights } from "@/lib/test-result-insights";
import { hasSafePerQuestionFeedback } from "@/lib/test-question-feedback";
import { TestResultInsightsPanel } from "@/components/test/test-result-insights-panel";
import { TestResultQuestionFeedback } from "@/components/test/test-result-question-feedback";
import { TestNextStepPanel } from "@/components/test/test-next-step-panel";
import type { TestPageLearningContext } from "@/lib/test-next-learning-step";
import { TestPostSubmitTimeline } from "@/components/test/test-post-submit-timeline";
import { cn } from "@/lib/utils";

export type { TestReviewRow } from "@/lib/test-result-insights";

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
  learning,
  onRetry,
  onAskMentor,
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
  learning: TestPageLearningContext;
  onRetry: () => void;
  onAskMentor?: () => void;
}) {
  const lessonHref = `/dashboard/course/${moduleId}/lesson`;
  const practiceHref = `/dashboard/course/${moduleId}/practice`;
  const courseHref = "/dashboard/course";

  const pendingManual = review.filter((r) => r.isCorrect === null);
  const insights = buildTestResultInsights(review);
  const showQuestionFeedback = hasSafePerQuestionFeedback(review);

  return (
    <div className="ce-test-result-screen ce-test-result space-y-6">
      <CyberHero className="ce-test-result-hero border-primary/25" padding="default">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <p className={cyber.monoLabel}>Результат теста</p>
            <h2 className="text-center font-display text-xl font-semibold text-balance text-foreground sm:text-left">{title}</h2>
            <Badge
              variant={passed ? "success" : "danger"}
              className="mt-1 w-fit gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            >
              {passed ? (
                <>
                  <CheckCircle2 className="size-3.5" aria-hidden />
                  Пройден
                </>
              ) : (
                <>
                  <XCircle className="size-3.5" aria-hidden />
                  Не пройден
                </>
              )}
            </Badge>
            <p className={cn("text-sm font-medium", passed ? "text-success" : "text-danger")}>
              {passed ? "Практика модуля доступна — закрепите материал в лаборатории." : "Повторите лекцию и пройдите тест снова."}
            </p>
          </div>
          <CircularProgress
            value={percent}
            size={120}
            strokeWidth={8}
            label={passed ? "Зачёт" : "Тест"}
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
          description="Можно переходить к практической лаборатории или повторить тест для закрепления."
        />
      ) : null}

      <SectionCard variant="default" flushTitle className="p-5 sm:p-6" title="Итог по темам">
        <TestResultInsightsPanel insights={insights} hasPerQuestionFeedback={showQuestionFeedback} />
      </SectionCard>

      {showQuestionFeedback ? (
        <SectionCard variant="default" flushTitle className="p-5 sm:p-6" title="Обратная связь по вопросам">
          <TestResultQuestionFeedback review={review} />
        </SectionCard>
      ) : null}

      <TestNextStepPanel learning={learning} passed={passed} />

      <SectionCard variant="muted" flushTitle className="p-5 sm:p-6">
        <TestPostSubmitTimeline />
      </SectionCard>

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
              <li>Вернитесь к лекции модуля и разделу «Ключевые идеи».</li>
              <li>Разберите вопросы из блока «Что повторить» выше.</li>
              <li>Пройдите тест ещё раз после повторения.</li>
            </>
          )}
          {pendingManual.length > 0 ? (
            <li className="text-warning">
              {pendingManual.length} ответ(ов) ожидают ручной проверки и не влияют на автоматический зачёт.
            </li>
          ) : null}
        </ul>
      </SectionCard>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild variant="outline" size="lg" className="min-h-12 w-full gap-2 touch-manipulation">
          <Link href={lessonHref}>
            <BookOpen className="size-4" aria-hidden />
            {TEST_RESULT_CTA.reviewMaterial}
          </Link>
        </Button>
        {passed ? (
          <Button asChild variant="primary" size="lg" className="min-h-12 w-full gap-2 touch-manipulation">
            <Link href={practiceHref}>
              <FlaskConical className="size-4" aria-hidden />
              {TEST_RESULT_CTA.practice}
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="lg" className="min-h-12 w-full gap-2" disabled title="Сначала сдайте тест">
            <FlaskConical className="size-4" aria-hidden />
            {TEST_RESULT_CTA.practice}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="min-h-12 w-full gap-2 touch-manipulation"
          onClick={onRetry}
        >
          <RotateCcw className="size-4" aria-hidden />
          {TEST_RESULT_CTA.retry}
        </Button>
        <Button asChild variant="ghost" size="lg" className="min-h-12 w-full touch-manipulation sm:col-span-2">
          <Link href={courseHref}>{TEST_RESULT_CTA.course}</Link>
        </Button>
        {onAskMentor ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-12 w-full gap-2 border-cyan/30 text-cyan hover:bg-cyan/10 touch-manipulation sm:col-span-2"
            onClick={onAskMentor}
          >
            <MessageSquare className="size-4" aria-hidden />
            Разобрать с AI-наставником
          </Button>
        ) : null}
      </div>
    </div>
  );
}
