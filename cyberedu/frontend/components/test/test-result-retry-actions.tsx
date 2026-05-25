"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { TEST_ATTEMPTS_EXHAUSTED_MESSAGE } from "@/lib/test-retry";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

export type TestResultRetryActionsProps = {
  passed: boolean;
  canRetry: boolean;
  onRetryTest: () => void;
  className?: string;
};

/** Повторная попытка теста; основной следующий шаг — в `TestNextStepPanel`. */
export function TestResultRetryActions({
  passed,
  canRetry,
  onRetryTest,
  className,
}: TestResultRetryActionsProps) {
  if (passed && !canRetry) return null;

  const handleRetry = () => {
    if (!canRetry) return;
    onRetryTest();
  };

  return (
    <SectionCard variant="default" flushTitle className={cn("p-4 sm:p-6", className)} title="Повторить тест">
      {!canRetry && !passed ? (
        <div
          className="mb-4 flex gap-3 rounded-xl border border-danger/30 bg-danger/[0.06] px-4 py-3"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          <p className="text-sm text-pretty text-foreground">{TEST_ATTEMPTS_EXHAUSTED_MESSAGE}</p>
        </div>
      ) : null}

      {canRetry ? (
        <>
          <p className="text-sm text-muted-foreground">
            {passed
              ? "Можно пройти тест ещё раз для закрепления — это не обязательно."
              : "После повторения материала запустите новую попытку."}
          </p>
          <Button
            type="button"
            variant={passed ? "outline" : "primary"}
            size="lg"
            className="mt-4 min-h-12 w-full touch-manipulation gap-2 sm:w-auto"
            onClick={handleRetry}
          >
            <RotateCcw className="size-4" aria-hidden />
            Повторить тест
          </Button>
        </>
      ) : null}
    </SectionCard>
  );
}
