"use client";

import { useEffect, useRef, useState, type TransitionStartFunction } from "react";
import { PracticeLabTerminal } from "@/components/practice/practice-lab-terminal";
import { PracticeSubmissionFormShell } from "@/components/practice/practice-submission-form-shell";
import { PracticeSubmissionSubmitFlow } from "@/components/practice/practice-submission-submit-flow";
import { submitPracticeTextAction } from "@/lib/actions/practice";
import {
  buildPracticeTextSubmitPayload,
  practiceSubmitSuccessMessage,
} from "@/lib/practice-submission-client";
import { buildTextSubmitSummary } from "@/lib/practice-submit-confirmation-ui";
import { minLengthCounterStatus } from "@/lib/practice-a11y";
import { validateTextAnswer } from "@/lib/practice-submission-form";
import type { PracticeSubmissionView, PracticeViewStatus } from "@/types/practice-view-model";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function PracticeSubmissionAnswerText({
  moduleId,
  taskId,
  minLength,
  practiceTitle,
  allowsResubmitOnRevision = true,
  seedText,
  status,
  submitDisabled,
  canRetry = false,
  startTransition,
  pending,
  onMessage,
}: {
  moduleId: string;
  taskId: string;
  minLength: number;
  practiceTitle: string;
  allowsResubmitOnRevision?: boolean;
  seedText?: string | null;
  status: PracticeViewStatus;
  submitDisabled: boolean;
  canRetry?: boolean;
  startTransition: TransitionStartFunction;
  pending: boolean;
  onMessage: (err: string | null, ok: string | null) => void;
}) {
  const initial =
    seedText && !seedText.trim().startsWith("{") && !seedText.trim().startsWith("[")
      ? seedText.trim()
      : "";
  const [text, setText] = useState(initial);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<PracticeSubmissionView | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const len = text.trim().length;
  const counter = minLengthCounterStatus(len, minLength);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 160)}px`;
  }, [text]);

  return (
    <PracticeSubmissionFormShell
      status={status}
      submitDisabled={submitDisabled}
      canRetry={canRetry}
      pending={pending}
      validationError={validationError}
      showValidationBanner={false}
      submissionResult={submissionResult}
    >
      <PracticeLabTerminal title="stdout — введите ответ">
        <div className="space-y-2">
          <Textarea
            ref={areaRef}
            label="Текстовый ответ"
            hint={`Минимум ${minLength} символов. Черновик хранится только в этой сессии вкладки.`}
            error={validationError ?? undefined}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setValidationError(null);
            }}
            rows={6}
            className="ce-terminal-input min-h-[160px] resize-y border-0 bg-transparent shadow-none focus-visible:ring-[var(--terminal-accent)]/40"
          />
          <p
            className={cn(
              "font-mono text-[11px] tabular-nums",
              counter.sufficient ? "text-success" : "text-muted-foreground",
            )}
            aria-live="polite"
          >
            <span className="sr-only">{counter.spokenLabel}. </span>
            <span aria-hidden>{len} / {minLength} символов</span>
            <span className="sr-only sm:not-sr-only sm:ml-2 sm:inline">
              {counter.sufficient ? "· достаточно" : "· нужно ещё"}
            </span>
          </p>
        </div>
      </PracticeLabTerminal>
      <PracticeSubmissionSubmitFlow
        practiceTitle={practiceTitle}
        allowsResubmitOnRevision={allowsResubmitOnRevision}
        label="Отправить ответ"
        pending={pending}
        disabled={len < minLength}
        startTransition={startTransition}
        getSummary={() => buildTextSubmitSummary(text)}
        validateBeforeOpen={() => validateTextAnswer(text, minLength)}
        onValidationError={setValidationError}
        onClearError={() => setValidationError(null)}
        onSubmit={async () => {
          const res = await submitPracticeTextAction(
            buildPracticeTextSubmitPayload({
              moduleId,
              practicalTaskId: taskId,
              text: text.trim(),
            }),
          );
          if (res.error) {
            setSubmissionResult(null);
            onMessage(res.error, null);
            return res.error;
          }
          setText("");
          if (res.submission) setSubmissionResult(res.submission);
          onMessage(
            null,
            res.submission
              ? practiceSubmitSuccessMessage(res.submission, res.pendingReview)
              : res.pendingReview
                ? "Ответ принят и ожидает проверки."
                : "Работа отправлена на проверку.",
          );
          return null;
        }}
      />
    </PracticeSubmissionFormShell>
  );
}
