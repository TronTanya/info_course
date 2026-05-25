"use client";

import {
  Ban,
  CheckCircle2,
  Clock,
  RotateCcw,
  Send,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import {
  buildSubmissionStatusPanelModel,
  isSubmissionPanelStatus,
  type SubmissionPanelStatus,
} from "@/lib/submission-status-panel";
import { PRACTICE_SUBMISSION_STATUS_ID } from "@/lib/practice-submit-confirmation-ui";
import type { PracticeSubmissionView, PracticeViewStatus } from "@/types/practice-view-model";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_ICON: Record<SubmissionPanelStatus, LucideIcon> = {
  submitted: Send,
  pending_review: Clock,
  approved: CheckCircle2,
  needs_retry: RotateCcw,
  rejected: XCircle,
  locked: Ban,
};

const STATUS_TONE: Record<
  SubmissionPanelStatus,
  "success" | "warning" | "danger" | "muted"
> = {
  submitted: "warning",
  pending_review: "warning",
  approved: "success",
  needs_retry: "danger",
  rejected: "danger",
  locked: "muted",
};

function toneClasses(tone: (typeof STATUS_TONE)[SubmissionPanelStatus]): string {
  switch (tone) {
    case "success":
      return "border-success/35 bg-success/[0.06] ring-success/20 text-success";
    case "warning":
      return "border-warning/35 bg-warning/[0.06] ring-warning/20 text-warning";
    case "danger":
      return "border-danger/35 bg-danger/[0.06] ring-danger/20 text-danger";
    default:
      return "border-border/70 bg-muted/15 ring-border/40 text-muted-foreground";
  }
}

export type SubmissionStatusPanelProps = {
  status: PracticeViewStatus;
  submission?: PracticeSubmissionView | null;
  lockedReason?: string | null;
  canRetry?: boolean;
  /** Якорь рабочей области для CTA «Доработать ответ». */
  reviseWorkspaceId?: string;
  onRevise?: () => void;
  className?: string;
  id?: string;
};

/**
 * Панель статуса отправки практики для студента.
 * Без admin-only notes, скрытой rubric и внутренних полей проверки.
 */
export function SubmissionStatusPanel({
  status,
  submission,
  lockedReason,
  canRetry,
  reviseWorkspaceId,
  onRevise,
  className,
  id = PRACTICE_SUBMISSION_STATUS_ID,
}: SubmissionStatusPanelProps) {
  const model = buildSubmissionStatusPanelModel({
    status,
    submission,
    lockedReason,
    canRetry,
  });

  if (!model || !isSubmissionPanelStatus(status)) return null;

  const Icon = STATUS_ICON[model.status];
  const tone = STATUS_TONE[model.status];

  function handleRevise() {
    if (onRevise) {
      onRevise();
      return;
    }
    if (reviseWorkspaceId && typeof document !== "undefined") {
      document.getElementById(reviseWorkspaceId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <section
      id={id}
      className={cn(
        "ce-submission-status-panel rounded-xl border px-4 py-4 ring-1 ring-inset",
        toneClasses(tone),
        className,
      )}
      aria-live="polite"
      role="status"
      aria-label="Статус отправки"
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] opacity-80">
              Статус
            </p>
            <p className="mt-0.5 font-display text-base font-semibold text-foreground">{model.headline}</p>
            {model.supporting ? (
              <p className="mt-1 text-sm text-pretty text-muted-foreground">{model.supporting}</p>
            ) : null}
            {model.status === "locked" && model.lockedReason ? (
              <p className="mt-2 text-sm text-foreground">{model.lockedReason}</p>
            ) : null}
          </div>

          {model.score != null && model.maxScore != null ? (
            <p className="font-mono text-xs tabular-nums text-foreground">
              Баллы: {model.score} / {model.maxScore}
            </p>
          ) : null}

          {model.submittedAtLabel ? (
            <p className="text-xs text-muted-foreground">
              {model.status === "pending_review" || model.status === "submitted"
                ? "Отправлено на проверку: "
                : "Отправлено: "}
              {model.submittedAtLabel}
            </p>
          ) : null}

          {model.feedback ? (
            <p className="rounded-lg border border-border/50 bg-background/40 px-3 py-2 text-sm text-foreground">
              <span className="font-medium">Комментарий проверяющего: </span>
              {model.feedback}
            </p>
          ) : null}

          {model.improvementItems && model.improvementItems.length > 0 ? (
            <div className="rounded-lg border border-warning/30 bg-warning/[0.05] px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-warning">Что улучшить</p>
              <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                {model.improvementItems.map((item) => (
                  <li key={item} className="text-pretty">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {model.status === "rejected" ? (
            <p className="text-xs text-muted-foreground">
              Следующий шаг: уточните требования в лекции модуля и при доступности практики отправьте новый
              ответ.
            </p>
          ) : null}

          {model.showReviseCta ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={handleRevise}
            >
              <RotateCcw className="size-4" aria-hidden />
              Доработать ответ
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
