import Link from "next/link";
import { BookOpen, FlaskConical, RotateCcw } from "lucide-react";
import type { SubmissionStatus } from "@prisma/client";
import { practiceImprovementTips, practiceResultHeadline, statusRu } from "@/lib/practice-lab-ui";
import { AnswerFeedback } from "@/components/ui/answer-feedback";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { SuccessState } from "@/components/ui/success-state";
import { formatRuDateTimeFullUtc } from "@/lib/datetime-stable";

export function PracticeLabAfterSubmit({
  moduleId,
  status,
  score,
  maxScore,
  adminComment,
  explanation,
  createdAt,
  onRetry,
  canRetry,
  nextPracticeAnchor,
}: {
  moduleId: string;
  status: SubmissionStatus;
  score: number | null;
  maxScore: number;
  adminComment: string | null;
  explanation: string | null;
  createdAt: string;
  onRetry?: () => void;
  canRetry: boolean;
  /** Якорь на следующую практику на странице (если есть). */
  nextPracticeAnchor?: string | null;
}) {
  const passed = status === "ACCEPTED";
  const pending = status === "SUBMITTED" || status === "CHECKING";
  const needsWork = status === "NEEDS_REVISION" || status === "REJECTED";
  const headline = practiceResultHeadline(status, passed);
  const tips = practiceImprovementTips(status, adminComment);
  const lessonHref = `/dashboard/course/${moduleId}/lesson`;

  return (
    <SectionCard variant="lab" flushTitle className="scroll-mt-24 p-5 sm:p-6" aria-labelledby="practice-result-heading">
      <h2 id="practice-result-heading" className="font-display text-lg font-semibold text-foreground">
        {headline}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {statusRu(status)}
        {score != null ? ` · ${score} / ${maxScore} б.` : ""} · {formatRuDateTimeFullUtc(createdAt)}
      </p>

      {passed ? (
        <SuccessState
          compact
          className="mt-5"
          title="Практика зачтена"
          description="Отличная работа. Можно вернуться к модулю или повторить задание для закрепления."
        />
      ) : null}

      {explanation?.trim() ? (
        <div className="mt-4">
          <AnswerFeedback
            variant={passed ? "correct" : needsWork ? "incorrect" : "neutral"}
            title={passed ? "Объяснение" : "Комментарий к проверке"}
            explanation={explanation.trim()}
          />
        </div>
      ) : adminComment?.trim() ? (
        <div className="mt-4">
          <AnswerFeedback variant={needsWork ? "incorrect" : "neutral"} title="Комментарий проверяющего" explanation={adminComment.trim()} />
        </div>
      ) : pending ? (
        <p className="mt-4 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3 text-sm text-muted-foreground">
          Работа на проверке. Разбор появится после решения преподавателя.
        </p>
      ) : null}

      {tips.length > 0 && !passed ? (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Что улучшить</p>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            {tips.map((t) => (
              <li key={t} className="flex gap-2 before:text-primary before:content-['•']">
                {t}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-2 border-t border-border/70 pt-5 sm:flex-row sm:flex-wrap">
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link href={lessonHref}>
            <BookOpen className="size-4" aria-hidden />
            К теории (лекция)
          </Link>
        </Button>
        {canRetry && onRetry ? (
          <Button type="button" variant="secondary" size="lg" className="gap-2" onClick={onRetry}>
            <RotateCcw className="size-4" aria-hidden />
            Попробовать ещё раз
          </Button>
        ) : null}
        {nextPracticeAnchor ? (
          <Button asChild variant="outline" size="lg" className="gap-2">
            <a href={nextPracticeAnchor}>Следующая практика</a>
          </Button>
        ) : null}
        {passed ? (
          <Button asChild variant="primary" size="lg" className="gap-2">
            <Link href={`/dashboard/course/${moduleId}`}>
              <FlaskConical className="size-4" aria-hidden />
              К модулю
            </Link>
          </Button>
        ) : null}
      </div>
    </SectionCard>
  );
}
