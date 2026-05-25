"use client";

import { useState, type TransitionStartFunction } from "react";
import { submitPracticeStructuredAction } from "@/lib/actions/practice";
import {
  buildPracticeStructuredSubmitPayload,
  practiceSubmitSuccessMessage,
} from "@/lib/practice-submission-client";
import { buildChecklistSubmitSummary } from "@/lib/practice-submit-confirmation-ui";
import { validateChecklistAnswer } from "@/lib/practice-submission-form";
import type { PracticeSubmissionView, PracticeViewStatus } from "@/types/practice-view-model";
import { PracticeSubmissionFormShell } from "@/components/practice/practice-submission-form-shell";
import { PracticeSubmissionSubmitFlow } from "@/components/practice/practice-submission-submit-flow";
import { Textarea } from "@/components/ui/textarea";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function PracticeSubmissionAnswerChecklist({
  moduleId,
  taskId,
  scenarioData,
  practiceTitle,
  allowsResubmitOnRevision = true,
  status,
  submitDisabled,
  canRetry = false,
  startTransition,
  pending,
  onMessage,
}: {
  moduleId: string;
  taskId: string;
  scenarioData: unknown;
  practiceTitle: string;
  allowsResubmitOnRevision?: boolean;
  status: PracticeViewStatus;
  submitDisabled: boolean;
  canRetry?: boolean;
  startTransition: TransitionStartFunction;
  pending: boolean;
  onMessage: (err: string | null, ok: string | null) => void;
}) {
  const sd = isRecord(scenarioData) ? scenarioData : null;
  const items = sd && Array.isArray(sd.items) ? sd.items.filter(isRecord) : [];
  const minR = Math.max(20, Math.min(2000, Number(sd?.reflectionMinLength) || 40));

  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [reflection, setReflection] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<PracticeSubmissionView | null>(null);

  if (!items.length) {
    return (
      <p className="text-sm text-danger" role="alert">
        Чек-лист не настроен для этого задания.
      </p>
    );
  }

  function toggle(id: string) {
    setChecked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
    setValidationError(null);
  }

  const checkedIds = [...checked];
  const reflectionLen = reflection.trim().length;

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
      <ul className="space-y-2">
        {items.map((it) => {
          const id = String(it.id ?? "");
          const label = String(it.label ?? id);
          return (
            <li key={id}>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input type="checkbox" checked={checked.has(id)} onChange={() => toggle(id)} className="mt-1" />
                <span>{label}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <Textarea
        label="Краткое объяснение"
        hint={`Не менее ${minR} символов.`}
        error={validationError ?? undefined}
        value={reflection}
        onChange={(e) => {
          setReflection(e.target.value);
          setValidationError(null);
        }}
        rows={5}
      />
      <p className="font-mono text-[11px] tabular-nums text-muted-foreground" aria-live="polite">
        {reflectionLen} / {minR} символов · отмечено {checkedIds.length} / {items.length}
      </p>
      <PracticeSubmissionSubmitFlow
        practiceTitle={practiceTitle}
        allowsResubmitOnRevision={allowsResubmitOnRevision}
        pending={pending}
        disabled={checkedIds.length < items.length || reflectionLen < minR}
        startTransition={startTransition}
        getSummary={() => buildChecklistSubmitSummary(checkedIds.length, items.length, reflectionLen)}
        validateBeforeOpen={() =>
          validateChecklistAnswer(checkedIds, reflection, minR, items.length)
        }
        onValidationError={setValidationError}
        onClearError={() => setValidationError(null)}
        onSubmit={async () => {
          const res = await submitPracticeStructuredAction(
            buildPracticeStructuredSubmitPayload({
              moduleId,
              practicalTaskId: taskId,
              payload: JSON.stringify({ checked: checkedIds, reflection: reflection.trim() }),
            }),
          );
          if (res.error) {
            setSubmissionResult(null);
            onMessage(res.error, null);
            return res.error;
          }
          if (res.submission) setSubmissionResult(res.submission);
          onMessage(
            null,
            res.submission
              ? practiceSubmitSuccessMessage(res.submission, res.pendingReview)
              : res.pendingReview
                ? "Ответ принят. Часть критериев уточняется на проверке преподавателем."
                : "Ответ отправлен на проверку.",
          );
          return null;
        }}
      />
    </PracticeSubmissionFormShell>
  );
}
