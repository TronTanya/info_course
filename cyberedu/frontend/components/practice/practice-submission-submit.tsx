"use client";

import { useRef } from "react";
import type { TransitionStartFunction } from "react";
import { Button } from "@/components/ui/button";

export type PracticeSubmissionSubmitProps = {
  label?: string;
  pending: boolean;
  disabled: boolean;
  startTransition: TransitionStartFunction;
  onSubmit: () => Promise<void>;
  onClearError?: () => void;
  className?: string;
};

/** Кнопка отправки с защитой от double submit. */
export function PracticeSubmissionSubmit({
  label = "Отправить на проверку",
  pending,
  disabled,
  startTransition,
  onSubmit,
  onClearError,
  className,
}: PracticeSubmissionSubmitProps) {
  const lockRef = useRef(false);

  return (
    <Button
      type="button"
      variant="primary"
      className={className ?? "w-full sm:w-auto"}
      loading={pending}
      disabled={disabled || pending}
      onClick={() => {
        if (lockRef.current || pending || disabled) return;
        lockRef.current = true;
        onClearError?.();
        startTransition(async () => {
          try {
            await onSubmit();
          } finally {
            lockRef.current = false;
          }
        });
      }}
    >
      {label}
    </Button>
  );
}
