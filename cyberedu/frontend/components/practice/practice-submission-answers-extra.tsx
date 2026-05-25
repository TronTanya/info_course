"use client";

import { useId, useState, type TransitionStartFunction } from "react";
import { TrainingConsole } from "@/components/practice/TrainingConsole";
import { PracticeLabTerminal } from "@/components/practice/practice-lab-terminal";
import { PracticeSubmissionFormShell } from "@/components/practice/practice-submission-form-shell";
import { PracticeSubmissionSubmitFlow } from "@/components/practice/practice-submission-submit-flow";
import { verifyPracticeInteractiveAction } from "@/lib/actions/practice";
import {
  buildPracticeUploadFormData,
  parsePracticeSubmitApiResponse,
  practiceSubmitSuccessMessage,
} from "@/lib/practice-submission-client";
import {
  buildCombinedSubmitSummary,
  buildLegacyAnswerSummary,
  buildManualReportSummary,
} from "@/lib/practice-submit-confirmation-ui";
import { validatePracticeFile, validateTextAnswer } from "@/lib/practice-submission-form";
import type { PracticeSubmissionView, PracticeViewStatus } from "@/types/practice-view-model";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function PracticeSubmissionAnswerCombined({
  moduleId,
  taskId,
  minLength,
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
  minLength: number;
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
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<PracticeSubmissionView | null>(null);
  const textLen = text.trim().length;

  return (
    <PracticeSubmissionFormShell
      status={status}
      submitDisabled={submitDisabled}
      canRetry={canRetry}
      pending={pending}
      validationError={validationError}
      submissionResult={submissionResult}
    >
      <p className="text-xs text-muted-foreground">Нужны текст и файл. Проверка — на сервере.</p>
      <PracticeLabTerminal title="answer@lab">
        <Textarea
          aria-label="Текстовая часть"
          hint={`Минимум ${minLength} символов.`}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setValidationError(null);
          }}
          rows={6}
          className="ce-terminal-input border-0 bg-transparent shadow-none"
        />
        <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {textLen} / {minLength}
        </p>
      </PracticeLabTerminal>
      <label htmlFor={fileInputId} className="text-sm font-medium text-foreground">
        Файл ({typesLabel}, до {maxMb} МБ)
      </label>
      <input
        id={fileInputId}
        type="file"
        accept={accept || undefined}
        className="block w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
          setValidationError(null);
        }}
      />
      <PracticeSubmissionSubmitFlow
        practiceTitle={practiceTitle}
        allowsResubmitOnRevision={allowsResubmitOnRevision}
        pending={pending}
        disabled={!file || textLen < minLength}
        startTransition={startTransition}
        getSummary={() => buildCombinedSubmitSummary(text, file)}
        validateBeforeOpen={() => validateTextAnswer(text, minLength) ?? validatePracticeFile(file, accept, maxMb)}
        onValidationError={setValidationError}
        onClearError={() => setValidationError(null)}
        onSubmit={async () => {
          const fd = buildPracticeUploadFormData({
            moduleId,
            practicalTaskId: taskId,
            file: file!,
            text: text.trim(),
          });
          const res = await fetch("/api/practice/submit-combined", { method: "POST", body: fd });
          const parsed = parsePracticeSubmitApiResponse(await res.json());
          if (!res.ok || !("ok" in parsed && parsed.ok)) {
            setSubmissionResult(null);
            const msg = "error" in parsed ? parsed.error : "Ошибка отправки";
            onMessage(msg, null);
            return msg;
          }
          setFile(null);
          setText("");
          setSubmissionResult(parsed.submission);
          onMessage(null, practiceSubmitSuccessMessage(parsed.submission));
          return null;
        }}
      />
    </PracticeSubmissionFormShell>
  );
}

export function PracticeSubmissionAnswerInteractive({
  moduleId,
  taskId,
  mode,
  consoleScenario,
  hasStructuredCommandStep,
  hasStructuredExplanationStep,
  hasAuto,
  minLength,
  accepted,
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
  mode: "structured" | "legacy" | "manual";
  consoleScenario: string | null;
  hasStructuredCommandStep: boolean;
  hasStructuredExplanationStep: boolean;
  hasAuto: boolean;
  minLength: number;
  accepted: boolean;
  practiceTitle: string;
  allowsResubmitOnRevision?: boolean;
  status: PracticeViewStatus;
  submitDisabled: boolean;
  canRetry?: boolean;
  startTransition: TransitionStartFunction;
  pending: boolean;
  onMessage: (err: string | null, ok: string | null) => void;
}) {
  const [legacyAnswer, setLegacyAnswer] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  if (accepted) {
    return <p className="text-sm text-muted-foreground">Задание выполнено.</p>;
  }

  if (submitDisabled) {
    return (
      <PracticeSubmissionFormShell
        status={status}
        submitDisabled
        canRetry={canRetry}
        pending={false}
      />
    );
  }

  const explanationMin = Math.max(12, minLength);

  if (mode === "structured") {
    return (
      <PracticeSubmissionFormShell
        status={status}
        submitDisabled={false}
        pending={pending}
        validationError={validationError}
      >
        <TrainingConsole
          instructionBanner={consoleScenario}
          structuredPractice={{
            moduleId,
            practicalTaskId: taskId,
            needsCommand: hasStructuredCommandStep,
            needsExplanation: hasStructuredExplanationStep,
            minLength: explanationMin,
            onSubmitResult: (err, ok) => {
              if (err) onMessage(err, null);
              else onMessage(null, ok);
            },
          }}
        />
      </PracticeSubmissionFormShell>
    );
  }

  return (
    <PracticeSubmissionFormShell
      status={status}
      submitDisabled={false}
      pending={pending}
      validationError={validationError}
    >
      {consoleScenario?.trim() ? (
        <div className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs whitespace-pre-wrap text-foreground">
          {consoleScenario.trim()}
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Учебная консоль — симулятор: команды не выполняются на реальной ОС.
      </p>
      <TrainingConsole />
      {mode === "legacy" ? (
        <div className="space-y-2">
          {!hasAuto ? (
            <p className="text-xs text-muted-foreground">Автопроверка на сервере не настроена — ответ уйдёт на ручную проверку.</p>
          ) : null}
          <label className="block space-y-1 text-sm">
            <span className="font-medium text-foreground">Ответ по заданию</span>
            <input
              className={cn(
                "w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
              )}
              value={legacyAnswer}
              onChange={(e) => {
                setLegacyAnswer(e.target.value);
                setValidationError(null);
              }}
              autoComplete="off"
            />
          </label>
          <PracticeSubmissionSubmitFlow
            practiceTitle={practiceTitle}
            allowsResubmitOnRevision={allowsResubmitOnRevision}
            label="Проверить"
            pending={pending}
            disabled={!legacyAnswer.trim()}
            startTransition={startTransition}
            getSummary={() => buildLegacyAnswerSummary(legacyAnswer)}
            onClearError={() => setValidationError(null)}
            onSubmit={async () => {
              const res = await verifyPracticeInteractiveAction({
                moduleId,
                practicalTaskId: taskId,
                answer: legacyAnswer.trim(),
              });
              if (res.error) {
                onMessage(res.error, null);
                return res.error;
              }
              if (res.fallbackManual) onMessage(null, "Ответ отправлен на ручную проверку.");
              else onMessage(null, "Ответ принят.");
              return null;
            }}
          />
        </div>
      ) : null}
      {mode === "manual" ? (
        <div className="space-y-3">
          <Textarea
            label="Отчёт"
            hint={`Минимум ${minLength} символов.`}
            value={manualNote}
            onChange={(e) => {
              setManualNote(e.target.value);
              setValidationError(null);
            }}
            rows={6}
          />
          <PracticeSubmissionSubmitFlow
            practiceTitle={practiceTitle}
            allowsResubmitOnRevision={allowsResubmitOnRevision}
            label="Отправить отчёт"
            pending={pending}
            disabled={manualNote.trim().length < minLength}
            startTransition={startTransition}
            getSummary={() => buildManualReportSummary(manualNote)}
            validateBeforeOpen={() => validateTextAnswer(manualNote, minLength)}
            onValidationError={setValidationError}
            onClearError={() => setValidationError(null)}
            onSubmit={async () => {
              const res = await verifyPracticeInteractiveAction({
                moduleId,
                practicalTaskId: taskId,
                explanation: manualNote.trim(),
              });
              if (res.error) {
                onMessage(res.error, null);
                return res.error;
              }
              onMessage(null, "Отправлено на ручную проверку.");
              return null;
            }}
          />
        </div>
      ) : null}
    </PracticeSubmissionFormShell>
  );
}
