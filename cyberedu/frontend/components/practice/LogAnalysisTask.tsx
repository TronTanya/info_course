"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  MINI_SOC_CONCLUSION_MIN,
  MINI_SOC_INCIDENT_OPTIONS,
  MINI_SOC_LOG_LINES,
  type MiniSocIncidentId,
} from "@/lib/log-analysis-mini-soc-score";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PracticeTaskBanner,
  PracticeTaskResult,
  PracticeTaskStep,
  type PracticeResultTone,
} from "@/components/practice/practice-task-ui";

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
  onResult: (error: string | null, success: string | null) => void;
};

export function LogAnalysisTask({ moduleId, practicalTaskId, disabled, onResult }: LogAnalysisTaskProps) {
  const [incidentType, setIncidentType] = useState<MiniSocIncidentId | "">("");
  const [conclusion, setConclusion] = useState("");
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const formComplete = useMemo(() => {
    return Boolean(incidentType) && conclusion.trim().length >= MINI_SOC_CONCLUSION_MIN;
  }, [incidentType, conclusion]);

  const runCheck = useCallback(() => {
    setFetchError(null);
    onResult(null, null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/practice/log-analysis/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleId,
            practicalTaskId,
            incidentType,
            conclusion,
          }),
        });
        const data = (await res.json()) as CheckResponse & { error?: string };
        if (!res.ok) {
          setFetchError(data.error || "Ошибка проверки");
          onResult(data.error || "Ошибка проверки", null);
          return;
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
      } catch {
        const msg = "Сеть недоступна. Попробуйте позже.";
        setFetchError(msg);
        onResult(msg, null);
      }
    });
  }, [moduleId, practicalTaskId, onResult, incidentType, conclusion]);

  const canRetry = checked && result && !result.saved;

  function resetAttempt() {
    setChecked(false);
    setResult(null);
    setIncidentType("");
    setConclusion("");
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

      <PracticeTaskStep title="1. Подозрительное поведение">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Опишите в выводе ниже, что смущает аналитика: последовательность событий, учётная запись, типы сообщений
          журнала. Сформулируйте нейтрально, с позиции мониторинга и реагирования.
        </p>
      </PracticeTaskStep>

      <PracticeTaskStep title="2. Тип возможного инцидента">
        <Select
          disabled={disabled || checked}
          value={incidentType}
          onChange={(e) => setIncidentType(e.target.value as MiniSocIncidentId | "")}
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
        label="3. Краткий вывод"
        hint={`Не менее ${MINI_SOC_CONCLUSION_MIN} символов. Включите формулировки про несколько неудачных попыток, успешный вход, подозрительность, учётную запись admin и сброс пароля (можно написать «password reset» или «сброс пароля»).`}
        value={conclusion}
        onChange={(e) => setConclusion(e.target.value)}
        rows={7}
        disabled={disabled || checked}
      />

      <div className="flex flex-wrap gap-2">
        <Button type="button" loading={pending} disabled={disabled || !formComplete || checked} onClick={runCheck}>
          Проверить
        </Button>
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
