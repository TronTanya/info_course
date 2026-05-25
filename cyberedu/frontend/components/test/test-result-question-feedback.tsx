"use client";

import { CheckCircle2, Clock, MessageSquare, XCircle } from "lucide-react";
import {
  buildSafeQuestionFeedbackList,
  questionGradingStatusLabel,
  type TestReviewFeedbackRow,
} from "@/lib/test-question-feedback";
import { cn } from "@/lib/utils";

export function TestResultQuestionFeedback({
  review,
  className,
}: {
  review: TestReviewFeedbackRow[];
  className?: string;
}) {
  const items = buildSafeQuestionFeedbackList(review);

  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm text-muted-foreground">
        Только обучающие подсказки с сервера — без правильных вариантов и без разбора ответов на клиенте.
      </p>
      <ol className="space-y-3" role="list" aria-label="Обратная связь по вопросам">
        {items.map((item) => {
          const status = item.gradingStatus;
          const StatusIcon =
            status === "credited" ? CheckCircle2 : status === "not_credited" ? XCircle : Clock;

          return (
            <li
              key={item.questionIndex}
              className="rounded-xl border border-border/70 bg-muted/15 px-4 py-3"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span className="font-mono tabular-nums">№{item.questionIndex}</span>
                {" · "}
                <span>Тема: {item.topic}</span>
              </p>
              {item.feedback ? (
                <p className="mt-2 flex gap-2 text-sm text-pretty text-foreground">
                  <MessageSquare className="mt-0.5 size-4 shrink-0 text-primary/80" aria-hidden />
                  <span>{item.feedback}</span>
                </p>
              ) : null}
              {status ? (
                <p
                  className={cn(
                    "mt-2 flex items-center gap-1.5 text-sm font-medium",
                    status === "credited" && "text-success",
                    status === "not_credited" && "text-danger",
                    status === "pending" && "text-muted-foreground",
                  )}
                  role="status"
                >
                  <StatusIcon className="size-4 shrink-0" aria-hidden />
                  {questionGradingStatusLabel(status)}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
