"use client";

import { useId, useState, type TransitionStartFunction } from "react";
import { PracticeLabTerminal } from "@/components/practice/practice-lab-terminal";
import { PracticeSubmissionFormShell } from "@/components/practice/practice-submission-form-shell";
import { PracticeSubmissionSubmitFlow } from "@/components/practice/practice-submission-submit-flow";
import { buildFileSubmitSummary } from "@/lib/practice-submit-confirmation-ui";
import {
  buildPracticeUploadFormData,
  parsePracticeSubmitApiResponse,
  practiceSubmitSuccessMessage,
} from "@/lib/practice-submission-client";
import { PRACTICE_FORM_VALIDATION_ERROR_ID } from "@/lib/practice-a11y";
import { formControlClass, formControlErrorClass } from "@/lib/ui/form-control";
import { validatePracticeFile } from "@/lib/practice-submission-form";
import { cn } from "@/lib/utils";
import type { PracticeSubmissionView, PracticeViewStatus } from "@/types/practice-view-model";

export function PracticeSubmissionAnswerFile({
  moduleId,
  taskId,
  accept,
  typesLabel,
  maxMb,
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
  accept: string;
  typesLabel: string;
  maxMb: number;
  practiceTitle: string;
  allowsResubmitOnRevision?: boolean;
  status: PracticeViewStatus;
  submitDisabled: boolean;
  canRetry?: boolean;
  startTransition: TransitionStartFunction;
  pending: boolean;
  onMessage: (err: string | null, ok: string | null) => void;
}) {
  const fileInputId = useId();
  const fileHintId = `${fileInputId}-hint`;
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<PracticeSubmissionView | null>(null);

  return (
    <PracticeSubmissionFormShell
      status={status}
      submitDisabled={submitDisabled}
      canRetry={canRetry}
      pending={pending}
      validationError={validationError}
      submissionResult={submissionResult}
    >
      <PracticeLabTerminal title="upload@lab">
        <p className="ce-terminal-dim text-xs">
          Форматы: {typesLabel}. До {maxMb} МБ. Проверка типа и размера — на сервере.
        </p>
      </PracticeLabTerminal>
      <label htmlFor={fileInputId} className="text-sm font-medium text-foreground">
        Файл для отправки
      </label>
      <p id={fileHintId} className="text-xs text-muted-foreground">
        Форматы: {typesLabel}. До {maxMb} МБ. Выберите файл с клавиатуры (Tab → Enter) или кнопкой «Выбрать файл».
      </p>
      <input
        id={fileInputId}
        type="file"
        accept={accept || undefined}
        aria-describedby={
          [fileHintId, validationError ? PRACTICE_FORM_VALIDATION_ERROR_ID : null].filter(Boolean).join(" ") ||
          undefined
        }
        aria-invalid={validationError ? true : undefined}
        className={cn(
          "block w-full cursor-pointer rounded-xl border bg-card/80 px-3 py-2 text-sm",
          formControlClass,
          validationError && formControlErrorClass,
          "file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary/90 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground",
        )}
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setValidationError(null);
        }}
      />
      {file ? (
        <p className="text-xs text-muted-foreground">
          {file.name} · {(file.size / 1024).toFixed(0)} КБ
        </p>
      ) : null}
      <PracticeSubmissionSubmitFlow
        practiceTitle={practiceTitle}
        allowsResubmitOnRevision={allowsResubmitOnRevision}
        label="Загрузить и отправить"
        pending={pending}
        disabled={!file}
        startTransition={startTransition}
        getSummary={() => buildFileSubmitSummary(file)}
        validateBeforeOpen={() => validatePracticeFile(file, accept, maxMb)}
        onValidationError={setValidationError}
        onClearError={() => setValidationError(null)}
        onSubmit={async () => {
          const fd = buildPracticeUploadFormData({ moduleId, practicalTaskId: taskId, file: file! });
          const res = await fetch("/api/practice/upload-file", { method: "POST", body: fd });
          const parsed = parsePracticeSubmitApiResponse(await res.json());
          if (!res.ok || !("ok" in parsed && parsed.ok)) {
            setSubmissionResult(null);
            const msg = "error" in parsed ? parsed.error : "Ошибка загрузки";
            onMessage(msg, null);
            return msg;
          }
          setFile(null);
          setSubmissionResult(parsed.submission);
          onMessage(null, practiceSubmitSuccessMessage(parsed.submission));
          return null;
        }}
      />
    </PracticeSubmissionFormShell>
  );
}
