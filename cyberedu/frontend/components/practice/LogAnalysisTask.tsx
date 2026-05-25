"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  MINI_SOC_CONCLUSION_MIN,
  MINI_SOC_INCIDENT_OPTIONS,
  MINI_SOC_LOG_LINES,
  type MiniSocIncidentId,
} from "@/lib/log-analysis-mini-soc-score";
import { PracticeSubmissionSubmitFlow } from "@/components/practice/practice-submission-submit-flow";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PracticeTaskBanner,
  PracticeTaskResult,
  PracticeTaskStep,
  type PracticeResultTone,
} from "@/components/practice/practice-task-ui";
import { buildLogAnalysisSubmitSummary } from "@/lib/practice-submit-confirmation-ui";

type CheckResponse = {
  score: number;
  maxScore: number;
  passed: boolean;
  feedback: string;
  saved?: boolean;
};

function logResultTone(result: CheckResponse): PracticeResultTone {
  if (result.saved) return "success";
  if (result.passed) return "good";
  return "retry";
}

export type LogAnalysisTaskProps = {
  moduleId: string;
  practicalTaskId: string;
  disabled?: boolean;
  practiceTitle?: string;
  allowsResubmitOnRevision?: boolean;
  onResult: (error: string | null, success: string | null) => void;
};

export function LogAnalysisTask({
  moduleId,
  practicalTaskId,
  disabled,
  practiceTitle = "Анализ журнала",
  allowsResubmitOnRevision = true,
  onResult,
}: LogAnalysisTaskProps) {
  const [suspiciousEvents, setSuspiciousEvents] = useState("");
  const [possibleCause, setPossibleCause] = useState<MiniSocIncidentId | "">("");
  const [recommendation, setRecommendation] = useState("");
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const conclusionPayload = useMemo(() => {
    const parts = [
      suspiciousEvents.trim() ? `Подозрительные события: ${suspiciousEvents.trim()}` : "",
      possibleCause.trim() ? `Возможная причина: ${MINI_SOC_INCIDENT_OPTIONS.find((o) => o.id === possibleCause)?.label ?? possibleCause}` : "",
      recommendation.trim() ? `Рекомендация: ${recommendation.trim()}` : "",
    ].filter(Boolean);
    return parts.join("\n\n");
  }, [suspiciousEvents, possibleCause, recommendation]);

  const formComplete = useMemo(() => {
    return (
      suspiciousEvents.trim().length > 0 &&
      Boolean(possibleCause) &&
      recommendation.trim().length > 0 &&
      conclusionPayload.length >= MINI_SOC_CONCLUSION_MIN
    );
  }, [suspiciousEvents, possibleCause, recommendation, conclusionPayload]);

  const performCheck = useCallback(async (): Promise<string | null> => {
    setFetchError(null);
    onResult(null, null);
    try {
      const res = await fetch("/api/practice/log-analysis/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          practicalTaskId,
          incidentType: possibleCause,
          conclusion: conclusionPayload,
        }),
      });
      const data = (await res.json()) as CheckResponse & { error?: string };
      if (!res.ok) {
        const msg = data.error || "Ошибка проверки";
        setFetchError(msg);
        onResult(msg, null);
        return msg;
      }
      setResult({
        score: data.score,
        maxScore: data.maxScore,
        passed: data.passed,
        feedback: data.feedback,
        saved: data.saved,
      });
      setChecked(true);
      if (data.saved) {
        onResult(null, "Результат сохранён. Задание засчитано.");
      } else {
        onResult(null, null);
      }
      return null;
    } catch {
      const msg = "Сеть недоступна. Попробуйте позже.";
      setFetchError(msg);
      onResult(msg, null);
      return msg;
    }
  }, [moduleId, practicalTaskId, onResult, possibleCause, conclusionPayload]);

  const canRetry = checked && result && !result.saved;

  function resetAttempt() {
    setChecked(false);
    setResult(null);
    setSuspiciousEvents("");
    setPossibleCause("");
    setRecommendation("");
    setFetchError(null);
  }

  return (
    <div className="space-y-5">
      <PracticeTaskBanner badge="Учебный SOC" variant="success">
        Журнал вымышленный, IP из частной сети. Цель — научиться замечать аномалии и фиксировать факты для защиты, а не
        воспроизводить действия злоумышленника.
      </PracticeTaskBanner>

      <PracticeTaskStep title="Фрагмент журнала аутентификации">
        <pre className="ce-terminal-body max-h-72 overflow-auto rounded-2xl border border-[var(--terminal-border)] bg-[var(--terminal-bg)] p-4 text-[11px] whitespace-pre shadow-inner sm:text-xs">
          {MINI_SOC_LOG_LINES.join("\n")}
        </pre>
      </PracticeTaskStep>

      <Textarea
        label="Подозрительные события"
        hint="Перечислите строки журнала или последовательность, которая вызывает опасения."
        value={suspiciousEvents}
        onChange={(e) => setSuspiciousEvents(e.target.value)}
        rows={4}
        disabled={disabled || checked}
      />

      <PracticeTaskStep title="Возможная причина">
        <Select
          disabled={disabled || checked}
          value={possibleCause}
          onChange={(e) => setPossibleCause(e.target.value as MiniSocIncidentId | "")}
          className="text-sm"
        >
          <option value="">Выберите вариант…</option>
          {MINI_SOC_INCIDENT_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </Select>
      </PracticeTaskStep>

      <Textarea
        label="Рекомендация"
        hint={`Что сделать аналитику или администратору. Совокупный ответ — не менее ${MINI_SOC_CONCLUSION_MIN} символов.`}
        value={recommendation}
        onChange={(e) => setRecommendation(e.target.value)}
        rows={4}
        disabled={disabled || checked}
      />
      <p className="font-mono text-[11px] tabular-nums text-muted-foreground" aria-live="polite">
        {conclusionPayload.length} / {MINI_SOC_CONCLUSION_MIN} символов (итог для проверки на сервере)
      </p>

      <div className="flex flex-wrap gap-2">
        <PracticeSubmissionSubmitFlow
          practiceTitle={practiceTitle}
          allowsResubmitOnRevision={allowsResubmitOnRevision}
          label="Проверить"
          pending={pending}
          disabled={Boolean(disabled) || !formComplete || checked}
          startTransition={startTransition}
          getSummary={() =>
            buildLogAnalysisSubmitSummary(
              {
                suspiciousEvents,
                possibleCause: possibleCause
                  ? (MINI_SOC_INCIDENT_OPTIONS.find((o) => o.id === possibleCause)?.label ?? possibleCause)
                  : "",
                recommendation,
              },
              conclusionPayload.length,
            )
          }
          validateBeforeOpen={() =>
            !formComplete ? "Заполните все поля анализа журнала." : null
          }
          onValidationError={setFetchError}
          onClearError={() => setFetchError(null)}
          onSubmit={performCheck}
        />
        {canRetry ? (
          <Button type="button" variant="outline" onClick={resetAttempt}>
            Попробовать снова
          </Button>
        ) : null}
      </div>

      {fetchError ? <p className="text-sm text-danger">{fetchError}</p> : null}

      {result && checked ? (
        <PracticeTaskResult
          tone={logResultTone(result)}
          title={`Оценка: ${result.score} из ${result.maxScore}${
            result.saved ? " — зачёт" : result.passed ? " — критерии выполнены" : " — доработайте ответ"
          }`}
          feedback={result.feedback}
          footer={
            result.saved ? (
              <p className="text-xs font-medium text-success">Ответ зафиксирован в журнале отправок.</p>
            ) : null
          }
        />
      ) : null}
    </div>
  );
}
