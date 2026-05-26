import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnswerFeedbackProps = {
  variant: "correct" | "incorrect" | "neutral";
  title: string;
  explanation?: string | null;
  className?: string;
};

/** Пояснение к ответу (тест, практика) — понятный cyber-callout. */
export function AnswerFeedback({ variant, title, explanation, className }: AnswerFeedbackProps) {
  const isCorrect = variant === "correct";
  const isIncorrect = variant === "incorrect";
  const Icon = isCorrect ? CheckCircle2 : isIncorrect ? XCircle : CheckCircle2;

  return (
    <div
      role="status"
      className={cn(
        "ce-answer-feedback rounded-xl border px-4 py-3 ring-1 ring-inset",
        isCorrect && "border-success/40 bg-success/8 ring-success/15 text-success",
        isIncorrect && "border-danger/40 bg-danger/8 ring-danger/15",
        variant === "neutral" && "border-border/70 bg-muted/20 ring-border/40",
        className,
      )}
    >
      <div className="flex gap-3">
        <Icon
          className={cn(
            "mt-0.5 size-5 shrink-0",
            isCorrect && "text-success",
            isIncorrect && "text-danger",
            variant === "neutral" && "text-muted-foreground",
          )}
          aria-hidden
        />
        <div className="min-w-0 space-y-1">
          <p
            className={cn(
              "text-sm font-semibold",
              isIncorrect ? "text-danger" : isCorrect ? "text-success" : "text-foreground",
            )}
          >
            {title}
          </p>
          {explanation?.trim() ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{explanation.trim()}</p>
          ) : isIncorrect ? (
            <p className="text-sm text-muted-foreground">
              Перечитайте формулировку вопроса и материал лекции — затем попробуйте снова.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
