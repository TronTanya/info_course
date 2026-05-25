"use client";

import { useRef, useState, type TransitionStartFunction } from "react";
import { Button } from "@/components/ui/button";
import { PracticeSubmitConfirmation } from "@/components/practice/practice-submit-confirmation";
import {
  scrollToPracticeSubmissionStatus,
  type PracticeSubmitSummary,
} from "@/lib/practice-submit-confirmation-ui";

export type PracticeSubmissionSubmitFlowProps = {
  practiceTitle: string;
  getSummary: () => PracticeSubmitSummary;
  allowsResubmitOnRevision?: boolean;
  label?: string;
  pending: boolean;
  disabled: boolean;
  startTransition: TransitionStartFunction;
  /** Валидация до открытия диалога; вернуть текст ошибки или null. */
  validateBeforeOpen?: () => string | null;
  onValidationError?: (message: string) => void;
  /** null — успех; строка — ошибка (показывается в диалоге). */
  onSubmit: () => Promise<string | null>;
  onClearError?: () => void;
  onSubmitSuccess?: () => void;
  scrollToStatusOnSuccess?: boolean;
  className?: string;
};

/** Кнопка отправки → диалог подтверждения → защита от double submit. */
export function PracticeSubmissionSubmitFlow({
  practiceTitle,
  getSummary,
  allowsResubmitOnRevision = true,
  label = "Отправить на проверку",
  pending,
  disabled,
  startTransition,
  validateBeforeOpen,
  onValidationError,
  onSubmit,
  onClearError,
  onSubmitSuccess,
  scrollToStatusOnSuccess = true,
  className,
}: PracticeSubmissionSubmitFlowProps) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<PracticeSubmitSummary>({});
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const lockRef = useRef(false);

  function openConfirm() {
    if (disabled || pending || lockRef.current) return;
    const validationErr = validateBeforeOpen?.();
    if (validationErr) {
      onValidationError?.(validationErr);
      return;
    }
    onClearError?.();
    setConfirmError(null);
    setSummary(getSummary());
    setOpen(true);
  }

  function runConfirm() {
    if (lockRef.current || pending || disabled) return;
    lockRef.current = true;
    setConfirmError(null);
    onClearError?.();
    startTransition(async () => {
      try {
        const err = await onSubmit();
        if (err) {
          setConfirmError(err);
          return;
        }
        setOpen(false);
        onSubmitSuccess?.();
        if (scrollToStatusOnSuccess) {
          requestAnimationFrame(() => scrollToPracticeSubmissionStatus());
        }
      } finally {
        lockRef.current = false;
      }
    });
  }

  return (
    <>
      <div className="ce-practice-submit-sticky-host -mx-0.5 max-lg:sticky max-lg:bottom-[calc(4.75rem+env(safe-area-inset-bottom,0))] max-lg:z-30 max-lg:rounded-xl max-lg:border max-lg:border-border/70 max-lg:bg-background/95 max-lg:p-3 max-lg:shadow-lg max-lg:backdrop-blur-md lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
        <Button
          type="button"
          variant="primary"
          className={
            className ??
            "ce-practice-submit-cta w-full min-h-12 touch-manipulation text-base font-semibold sm:w-auto"
          }
          disabled={disabled || pending}
          onClick={openConfirm}
        >
          {label}
        </Button>
      </div>
      <PracticeSubmitConfirmation
        open={open}
        onOpenChange={setOpen}
        practiceTitle={practiceTitle}
        summary={summary}
        allowsResubmitOnRevision={allowsResubmitOnRevision}
        pending={pending}
        error={confirmError}
        onConfirm={runConfirm}
      />
    </>
  );
}
