"use client";

import type { ReactNode } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { SubmissionStatusPanel } from "@/components/practice/submission-status-panel";
import { PRACTICE_FORM_VALIDATION_ERROR_ID } from "@/lib/practice-a11y";
import { practiceSubmissionBlockedMessage } from "@/lib/practice-submission-form";
import type { PracticeSubmissionView, PracticeViewStatus } from "@/types/practice-view-model";
import { cn } from "@/lib/utils";

export type PracticeSubmissionFormShellProps = {
  status: PracticeViewStatus;
  submitDisabled: boolean;
  canRetry?: boolean;
  pending: boolean;
  validationError?: string | null;
  /** false — ошибка только у поля (Textarea и т.п.), без дублирующего баннера. */
  showValidationBanner?: boolean;
  submissionResult?: PracticeSubmissionView | null;
  children?: ReactNode;
  className?: string;
};

export function PracticeSubmissionFormShell({
  status,
  submitDisabled,
  canRetry = false,
  pending,
  validationError,
  showValidationBanner = true,
  submissionResult,
  children,
  className,
}: PracticeSubmissionFormShellProps) {
  if (submitDisabled) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground",
          className,
        )}
        role="status"
      >
        {practiceSubmissionBlockedMessage(status, canRetry)}
      </div>
    );
  }

  const showBanner = showValidationBanner && !!validationError;
  const formDescribedBy = showBanner ? PRACTICE_FORM_VALIDATION_ERROR_ID : undefined;

  return (
    <form
      className={cn("ce-practice-submission-form space-y-3", className)}
      noValidate
      onSubmit={(e) => e.preventDefault()}
      aria-describedby={formDescribedBy}
      aria-busy={pending || undefined}
    >
      {submissionResult ? (
        <SubmissionStatusPanel status={submissionResult.status} submission={submissionResult} />
      ) : null}
      {pending ? (
        <div
          className="flex items-center gap-2 rounded-lg border border-cyan/20 bg-cyan/5 px-3 py-2 text-xs text-muted-foreground"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="size-3.5 shrink-0 animate-spin text-cyan" aria-hidden />
          Отправка на сервер…
        </div>
      ) : null}
      {showBanner ? (
        <p
          id={PRACTICE_FORM_VALIDATION_ERROR_ID}
          className="flex items-start gap-2 rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{validationError}</span>
        </p>
      ) : null}
      <fieldset
        className={cn("min-w-0 space-y-3 border-0 p-0", pending && "pointer-events-none opacity-60")}
        disabled={pending}
        aria-disabled={pending || undefined}
      >
        {children}
      </fieldset>
    </form>
  );
}
