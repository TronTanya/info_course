"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, BookOpen, CheckCircle2, FlaskConical, MessageSquare, RotateCcw, XCircle } from "lucide-react";
import type { LearningStepLink } from "@/lib/learning-nav";
import { Badge } from "@/components/ui/badge";
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
  nextStep = null,
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
  nextStep?: LearningStepLink | null;
  onRetry: () => void;
  onAskMentor?: () => void;
}) {
  const lessonHref = `/dashboard/course/${moduleId}/lesson`;
  const practiceHref = `/dashboard/course/${moduleId}/practice`;
  const moduleHref = `/dashboard/course/${moduleId}`;

  const wrong = review.filter((r) => r.isCorrect === false);
  const correct = review.filter((r) => r.isCorrect === true);
  const pendingManual = review.filter((r) => r.isCorrect === null);
  const nextLesson =
    nextStep && !nextStep.disabled && nextStep.href.includes("/lesson") ? nextStep : null;

  return (
    <div className="ce-test-result space-y-6">
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

      {!passed ? (
        <section
          className="rounded-2xl border border-danger/30 bg-danger/5 p-5 ring-1 ring-danger/15 sm:p-6"
          aria-labelledby="test-retry-plan-heading"
        >
          <h3
            id="test-retry-plan-heading"
            className="flex items-center gap-2 font-display text-base font-semibold text-foreground"
          >
            <BookOpen className="size-4 text-danger" aria-hidden />
            С чего начать повторение
          </h3>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">
            Вернитесь к лекции модуля, пройдите блок «Ключевые идеи» и разберите вопросы из раздела «Что повторить» ниже.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
              <Link href={lessonHref}>К лекции</Link>
            </Button>
            <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" onClick={onRetry}>
              <RotateCcw className="size-4" aria-hidden />
              Повторить тест
            </Button>
          </div>
        </section>
      ) : null}

      {passed ? (
        <SuccessState
          compact
          title="Тест успешно пройден"
          description="Можно переходить к практической лаборатории или повторить тест для закрепления."
        />
      ) : null}

      <SectionCard variant="default" flushTitle className="p-5 sm:p-6" title="Разбор ответов">
        <p className="mb-4 text-sm text-muted-foreground">
          Ниже — все вопросы с результатом проверки. Пояснения показаны только после отправки.
        </p>
        {wrong.length > 0 ? (
          <div className="mb-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-danger">
              Неверно · {wrong.length}
            </p>
            <ul className="space-y-3">
              {wrong.map((row) => {
                const index = review.findIndex((r) => r.questionId === row.questionId);
                return (
                  <li key={row.questionId}>
                    <AnswerFeedback
                      variant="incorrect"
                      title={`${index + 1}. ${row.questionText} · ${row.pointsEarned}/${row.maxPoints} б.`}
                      explanation={row.explanation}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        {correct.length > 0 ? (
          <div className="mb-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-success">
              Верно · {correct.length}
            </p>
            <ul className="space-y-3">
              {correct.map((row) => {
                const index = review.findIndex((r) => r.questionId === row.questionId);
                return (
                  <li key={row.questionId}>
                    <AnswerFeedback
                      variant="correct"
                      title={`${index + 1}. ${row.questionText} · ${row.pointsEarned}/${row.maxPoints} б.`}
                      explanation={row.explanation}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
        {pendingManual.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              На проверке · {pendingManual.length}
            </p>
            <ul className="space-y-3">
              {pendingManual.map((row) => {
                const index = review.findIndex((r) => r.questionId === row.questionId);
                return (
                  <li key={row.questionId}>
                    <AnswerFeedback
                      variant="neutral"
                      title={`${index + 1}. ${row.questionText} · ожидает проверки`}
                      explanation={row.explanation}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </SectionCard>

      {wrong.length > 0 ? (
        <section className="space-y-3 rounded-2xl border border-danger/25 bg-danger/4 p-5 ring-1 ring-danger/15 sm:p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
            <AlertTriangle className="size-4 text-danger" aria-hidden />
            Что повторить
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {wrong.slice(0, 5).map((row) => (
              <li key={row.questionId} className="text-pretty">
                · {row.questionText}
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
        {onAskMentor ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-2 border-cyan/30 text-cyan hover:bg-cyan/10 sm:col-span-2"
            onClick={onAskMentor}
          >
            <MessageSquare className="size-4" aria-hidden />
            Разобрать с AI-наставником
          </Button>
        ) : null}
        <Button type="button" variant="outline" size="lg" className="w-full gap-2" onClick={onRetry}>
          <RotateCcw className="size-4" aria-hidden />
          Повторить тест
        </Button>
        {nextLesson ? (
          <Button asChild variant="outline" size="lg" className="w-full gap-2">
            <Link href={nextLesson.href}>
              <ArrowRight className="size-4" aria-hidden />
              Следующий урок
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" size="lg" className="w-full gap-2">
            <Link href={lessonHref}>
              <BookOpen className="size-4" aria-hidden />
              К лекции
            </Link>
          </Button>
        )}
        <Button asChild variant={passed ? "primary" : "secondary"} size="lg" className="w-full gap-2 sm:col-span-2">
          <Link href={practiceHref}>
            <FlaskConical className="size-4" aria-hidden />
            {passed ? "Перейти к практике" : "Практика (после зачёта)"}
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full sm:col-span-2">
          <Link href={moduleHref}>К обзору модуля</Link>
        </Button>
      </div>
    </div>
  );
}
