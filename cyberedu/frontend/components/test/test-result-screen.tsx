"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { formatTestSubmitResultAnnouncement } from "@/lib/test-a11y";
import { buildTestResultViewModel } from "@/lib/test-view-mapper";
import { formatTestResultAttemptInfo } from "@/lib/test-flow";
import type { TestReviewRow } from "@/lib/test-result-insights";
import { formatPassingScore } from "@/lib/test-ui";
import { TestResultAIMentorPanel } from "@/components/test/test-result-ai-mentor-panel";
import { TestNextStepPanel } from "@/components/test/test-next-step-panel";
import { TestResultRecommendations } from "@/components/test/test-result-recommendations";
import { TestResultRetryActions } from "@/components/test/test-result-retry-actions";
import type { TestPageLearningContext } from "@/lib/test-next-learning-step";
import { TestResultStrongTopics } from "@/components/test/test-result-strong-topics";
import { TestResultWeakTopics } from "@/components/test/test-result-weak-topics";
import { TestResultQuestionFeedback } from "@/components/test/test-result-question-feedback";
import { hasSafePerQuestionFeedback } from "@/lib/test-question-feedback";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { CyberHero } from "@/components/cyber/cyber-hero";
import { cyber } from "@/lib/design-system/cyber";
import { buildTestMentorSafeContext } from "@/lib/test-mentor-panel";
import type { MentorModeId } from "@/lib/ai/mentor-ui/modes";
import { cn } from "@/lib/utils";

export type { TestReviewRow } from "@/lib/test-result-insights";

export type TestResultScreenProps = {
  moduleId: string;
  moduleTitle?: string;
  title: string;
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean;
  /** Проходной порог (баллы) */
  minScore: number;
  /** С сервера после submit; показываем только при totalGraded > 0 */
  correctCount: number;
  totalGraded: number;
  review: TestReviewRow[];
  learning: TestPageLearningContext;
  /** Попыток уже учтено на сервере (включая текущую) */
  attemptsUsed?: number;
  maxAttempts?: number | null;
  /** С сервера после submit; иначе вычисляется по attemptsUsed / maxAttempts */
  canRetry?: boolean;
  onRetry: () => void;
  aiMentorConfigured?: boolean;
  onOpenMentorChat?: (bootModeId?: MentorModeId, bootPrompt?: string) => void;
};

/**
 * Экран результата теста (ЭТАП 9): только безопасные поля с сервера.
 * Без answer key, без id правильных вариантов, без raw scoring rules.
 */
export function TestResultScreen({
  moduleId,
  moduleTitle,
  title,
  score,
  maxScore,
  percent,
  passed,
  minScore,
  correctCount,
  totalGraded,
  review,
  learning,
  attemptsUsed,
  maxAttempts = null,
  canRetry: canRetryProp,
  onRetry,
  aiMentorConfigured = true,
  onOpenMentorChat,
}: TestResultScreenProps) {
  const effectiveCanRetry = canRetryProp ?? true;

  function handleRetry() {
    if (!effectiveCanRetry) return;
    onRetry();
  }
  const headline = passed ? "Тест пройден" : "Нужно повторить";
  const attemptLine =
    attemptsUsed != null && attemptsUsed > 0
      ? formatTestResultAttemptInfo(attemptsUsed, maxAttempts)
      : null;
  const showCorrectCount = totalGraded > 0 && correctCount >= 0;

  const model = buildTestResultViewModel({
    attemptId: "current",
    score,
    maxScore,
    percentage: percent,
    passed,
    correctCount: showCorrectCount ? correctCount : undefined,
    totalCount: totalGraded,
    moduleId,
    review,
    canRetry: effectiveCanRetry,
    attemptsUsed,
    attemptLimit: maxAttempts,
  });

  const canRetry = model.canRetry;
  const showQuestionFeedback = hasSafePerQuestionFeedback(review);

  const mentorSafeContext = buildTestMentorSafeContext({
    moduleId,
    testTitle: title,
    moduleTitle: moduleTitle ?? "Модуль",
    percent,
    passed,
  });

  const resultAnnouncement = formatTestSubmitResultAnnouncement(passed, percent, score, maxScore);

  return (
    <div className="ce-test-result-screen min-w-0 space-y-4 overflow-x-clip md:space-y-6">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {resultAnnouncement}
      </p>
      <CyberHero className="ce-test-result-hero border-primary/25" padding="default">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <p className={cyber.monoLabel}>Результат теста</p>
            <h2 className="text-center font-display text-xl font-semibold text-balance text-foreground sm:text-left">
              {headline}
            </h2>
            <h3 className="text-center text-base font-medium text-pretty text-muted-foreground sm:text-left">
              {title}
            </h3>
            <Badge
              variant={passed ? "success" : "danger"}
              className="mt-1 w-fit gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              aria-hidden
            >
              {passed ? (
                <>
                  <CheckCircle2 className="size-3.5" aria-hidden />
                  {headline}
                </>
              ) : (
                <>
                  <XCircle className="size-3.5" aria-hidden />
                  {headline}
                </>
              )}
            </Badge>
            {attemptLine ? (
              <p className="text-xs text-muted-foreground" role="status">
                {attemptLine}
              </p>
            ) : null}
          </div>
          <div className="shrink-0 max-md:scale-90">
            <CircularProgress
              value={percent}
              size={120}
              strokeWidth={8}
              label={`${percent}%`}
              tone={passed ? "success" : "default"}
            />
          </div>
        </div>

        <div className="relative mt-6 space-y-3">
          <ProgressBar
            label="Результат"
            value={percent}
            max={100}
            tone={passed ? "success" : "default"}
          />
          <dl className="ce-test-result-stats grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Баллы</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                {score}
                {maxScore > 0 ? ` / ${maxScore}` : null}
              </dd>
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Процент</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">{percent}%</dd>
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Проходной порог</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {formatPassingScore(minScore, maxScore)}
              </dd>
            </div>
            {showCorrectCount && model.correctCount != null ? (
              <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Верных ответов</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                  {model.correctCount} / {totalGraded}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </CyberHero>

      {canRetry || !passed ? (
        <TestResultRetryActions passed={passed} canRetry={canRetry} onRetryTest={handleRetry} />
      ) : null}

      {showQuestionFeedback ? (
        <SectionCard variant="default" flushTitle className="p-4 sm:p-6" title="Обратная связь по вопросам">
          <TestResultQuestionFeedback review={review} />
        </SectionCard>
      ) : null}

      <details className="ce-mobile-accordion ce-glass group rounded-2xl border border-border/60 md:hidden" open>
        <summary className="cursor-pointer list-none px-4 py-3.5 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
          Сильные и слабые темы
        </summary>
        <div className="space-y-4 border-t border-border/60 px-4 pb-4 pt-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-success">Сильные</p>
            <TestResultStrongTopics topics={model.strongTopics} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-danger">Повторить</p>
            <TestResultWeakTopics topics={model.weakTopics} />
          </div>
        </div>
      </details>

      <SectionCard variant="default" flushTitle className="hidden p-5 sm:p-6 md:block" title="Сильные темы">
        <p className="mb-3 text-sm text-muted-foreground">Темы, которые вы усвоили по результатам автоматической проверки.</p>
        <TestResultStrongTopics topics={model.strongTopics} />
      </SectionCard>

      <SectionCard variant="default" flushTitle className="hidden p-5 sm:p-6 md:block" title="Слабые темы">
        <p className="mb-3 text-sm text-muted-foreground">
          {showQuestionFeedback
            ? "Темы для повторения. Правильные варианты не показываются — только обучающие подсказки с сервера."
            : "Темы для повторения по результатам проверки. Детальная обратная связь по вопросам недоступна — см. рекомендации ниже."}
        </p>
        <TestResultWeakTopics topics={model.weakTopics} />
      </SectionCard>

      {model.recommendations.length > 0 ? (
        <SectionCard variant="muted" flushTitle className="p-4 sm:p-6" title="Дополнительно">
          <TestResultRecommendations items={model.recommendations} />
        </SectionCard>
      ) : null}

      <TestResultAIMentorPanel
        aiConfigured={aiMentorConfigured}
        context={mentorSafeContext}
        onOpenMentorChat={(modeId, bootPrompt) => onOpenMentorChat?.(modeId, bootPrompt)}
      />

      <TestNextStepPanel learning={learning} passed={passed} />

      <p
        className={cn(
          "text-center text-xs text-muted-foreground",
          passed ? "text-success/90" : "text-muted-foreground",
        )}
        role="status"
      >
        {passed
          ? canRetry
            ? "Зачёт получен — переходите к практике или повторите тест для закрепления."
            : "Зачёт получен — переходите к практике модуля."
          : canRetry
            ? "Повторите слабые темы и пройдите тест снова."
            : "Повторите материал модуля и обратитесь к преподавателю."}
      </p>
    </div>
  );
}
