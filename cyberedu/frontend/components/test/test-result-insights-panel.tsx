"use client";

import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import type { TestResultInsights } from "@/lib/test-result-insights";
import { cn } from "@/lib/utils";

function InsightList({
  items,
  variant,
  hasPerQuestionFeedback,
}: {
  items: TestResultInsights["strengths"];
  variant: "strength" | "review";
  hasPerQuestionFeedback: boolean;
}) {
  if (items.length === 0) return null;

  const Icon = variant === "strength" ? CheckCircle2 : AlertTriangle;
  const boxClass =
    variant === "strength"
      ? "border-success/25 bg-success/[0.04]"
      : "border-danger/25 bg-danger/[0.04]";

  return (
    <ul className="space-y-3" role="list">
      {items.map((item) => (
        <li key={`${variant}-${item.questionIndex}`} className={cn("rounded-xl border px-4 py-3", boxClass)}>
          <div className="flex gap-2">
            <Icon
              className={cn("mt-0.5 size-4 shrink-0", variant === "strength" ? "text-success" : "text-danger")}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                <span className="font-mono text-xs text-muted-foreground">№{item.questionIndex}</span>{" "}
                {item.topicLabel}
              </p>
              {item.detail ? (
                <p className="mt-1 text-sm text-pretty text-muted-foreground">{item.detail}</p>
              ) : hasPerQuestionFeedback ? (
                <p className="mt-1 text-sm text-muted-foreground">См. обратную связь по вопросам ниже.</p>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TestResultInsightsPanel({
  insights,
  hasPerQuestionFeedback = false,
  className,
}: {
  insights: TestResultInsights;
  hasPerQuestionFeedback?: boolean;
  className?: string;
}) {
  const { strengths, toReview, pendingCount } = insights;
  const hasStrengths = strengths.length > 0;
  const hasReview = toReview.length > 0;

  if (!hasStrengths && !hasReview && pendingCount === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Нет автоматически оценённых вопросов для разбора по темам.
      </p>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {hasStrengths ? (
        <section aria-labelledby="test-strengths-heading">
          <h3 id="test-strengths-heading" className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle2 className="size-4 text-success" aria-hidden />
            Темы, которые усвоены
            <span className="font-normal text-muted-foreground">({strengths.length})</span>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">По этим вопросам ответ засчитан — можно опираться на них в практике.</p>
          <div className="mt-3">
            <InsightList
              items={strengths}
              variant="strength"
              hasPerQuestionFeedback={hasPerQuestionFeedback}
            />
          </div>
        </section>
      ) : null}

      {hasReview ? (
        <section aria-labelledby="test-review-heading">
          <h3 id="test-review-heading" className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="size-4 text-danger" aria-hidden />
            Темы для повторения
            <span className="font-normal text-muted-foreground">({toReview.length})</span>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Вернитесь к лекции и разберите эти темы перед следующей попыткой.
          </p>
          <div className="mt-3">
            <InsightList
              items={toReview}
              variant="review"
              hasPerQuestionFeedback={hasPerQuestionFeedback}
            />
          </div>
        </section>
      ) : null}

      {pendingCount > 0 ? (
        <p className="flex items-start gap-2 rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
          {pendingCount}{" "}
          {pendingCount === 1 ? "ответ ожидает" : pendingCount < 5 ? "ответа ожидают" : "ответов ожидают"} ручной
          проверки — они не входят в список тем выше.
        </p>
      ) : null}
    </div>
  );
}
