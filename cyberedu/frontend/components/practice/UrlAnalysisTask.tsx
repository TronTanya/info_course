"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  URL_ANALYSIS_ITEMS,
  URL_ANALYSIS_REASON_IDS,
  URL_ANALYSIS_REASON_LABELS,
  type UrlAnalysisReasonId,
} from "@/lib/url-analysis-score";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cyber } from "@/lib/design-system/cyber";
import {
  PracticeTaskBanner,
  PracticeTaskResult,
  practiceToggleClass,
  type PracticeResultTone,
} from "@/components/practice/practice-task-ui";
import { cn } from "@/lib/utils";

type Verdict = "" | "safe" | "unsafe";

type RowState = { verdict: Verdict; reason: string };

type CheckResponse = {
  score: number;
  maxScore: number;
  passed: boolean;
  feedback: string;
  saved?: boolean;
};

const EXPL_MIN = 35;

function urlResultTone(result: CheckResponse): PracticeResultTone {
  if (result.saved || result.score >= 9) return "success";
  if (result.passed) return "good";
  if (result.score >= 7) return "retry";
  return "fail";
}

function initialRows(): Record<string, RowState> {
  const o: Record<string, RowState> = {};
  for (const it of URL_ANALYSIS_ITEMS) {
    o[it.id] = { verdict: "", reason: "" };
  }
  return o;
}

export type UrlAnalysisTaskProps = {
  moduleId: string;
  practicalTaskId: string;
  disabled?: boolean;
  onResult: (error: string | null, success: string | null) => void;
};

export function UrlAnalysisTask({ moduleId, practicalTaskId, disabled, onResult }: UrlAnalysisTaskProps) {
  const [rows, setRows] = useState<Record<string, RowState>>(initialRows);
  const [explanation, setExplanation] = useState("");
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const setVerdict = useCallback((id: string, verdict: Verdict) => {
    setRows((prev) => ({
      ...prev,
      [id]: {
        verdict,
        reason: verdict === "safe" ? "" : prev[id]?.reason ?? "",
      },
    }));
  }, []);

  const setReason = useCallback((id: string, reason: string) => {
    setRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], reason },
    }));
  }, []);

  const formComplete = useMemo(() => {
    for (const it of URL_ANALYSIS_ITEMS) {
      const r = rows[it.id];
      if (!r || !r.verdict) return false;
      if (r.verdict === "unsafe" && !r.reason) return false;
    }
    return explanation.trim().length >= EXPL_MIN;
  }, [rows, explanation]);

  const runCheck = useCallback(() => {
    setFetchError(null);
    onResult(null, null);
    startTransition(async () => {
      try {
        const payloadRows = URL_ANALYSIS_ITEMS.map((it) => {
          const r = rows[it.id];
          return {
            id: it.id,
            verdict: r?.verdict === "safe" ? "safe" : "unsafe",
            reason: r?.verdict === "unsafe" && r.reason ? r.reason : null,
          };
        });
        const res = await fetch("/api/practice/url-analysis/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleId,
            practicalTaskId,
            rows: payloadRows,
            explanation,
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
  }, [moduleId, practicalTaskId, onResult, rows, explanation]);

  const canRetry = checked && result && !result.saved;

  function resetAttempt() {
    setChecked(false);
    setResult(null);
    setRows(initialRows());
    setExplanation("");
    setFetchError(null);
  }

  return (
    <div className="space-y-5">
      <PracticeTaskBanner badge="Учебные URL">
        Все адреса вымышленные и служат только для учебного разбора. Сравнивайте протокол, написание домена и
        структуру имени хоста.
      </PracticeTaskBanner>

      <div className={cn(cyber.adminTable, "ce-scroll-x-contained -mx-1 min-w-0 px-1")}>
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-3 w-10">#</th>
              <th className="px-3 py-3 min-w-[200px]">Ссылка</th>
              <th className="px-3 py-3 w-[200px]">Статус</th>
              <th className="px-3 py-3 min-w-[180px]">Причина (если подозрительно)</th>
            </tr>
          </thead>
          <tbody>
            {URL_ANALYSIS_ITEMS.map((it, idx) => {
              const r = rows[it.id] ?? { verdict: "" as Verdict, reason: "" };
              const lockedRow = disabled || checked;
              return (
                <tr key={it.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-3 align-top text-muted-foreground">{idx + 1}</td>
                  <td className="px-3 py-3 align-top font-mono text-[12px] sm:text-[13px] break-all text-foreground">
                    {it.url}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={lockedRow}
                          onClick={() => setVerdict(it.id, "safe")}
                          className={practiceToggleClass(r.verdict === "safe", lockedRow, "safe")}
                        >
                          Безопасно
                        </button>
                        <button
                          type="button"
                          disabled={lockedRow}
                          onClick={() => setVerdict(it.id, "unsafe")}
                          className={practiceToggleClass(r.verdict === "unsafe", lockedRow, "unsafe")}
                        >
                          Подозрительно
                        </button>
                      </div>
                      {r.verdict === "safe" ? (
                        <Badge variant="success">безопасно</Badge>
                      ) : r.verdict === "unsafe" ? (
                        <Badge variant="danger">подозрительно</Badge>
                      ) : (
                        <Badge variant="outline">не выбрано</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    {r.verdict === "unsafe" ? (
                      <Select
                        disabled={lockedRow}
                        value={r.reason}
                        onChange={(e) => setReason(it.id, e.target.value)}
                        className="text-xs sm:text-sm"
                      >
                        <option value="">Выберите причину…</option>
                        {(URL_ANALYSIS_REASON_IDS as readonly UrlAnalysisReasonId[]).map((rid) => (
                          <option key={rid} value={rid}>
                            {URL_ANALYSIS_REASON_LABELS[rid]}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Textarea
        label="Короткое объяснение"
        hint={`Минимум ${EXPL_MIN} символов. Упомяните домен, протокол http/https или признаки подозрительной ссылки.`}
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
        rows={4}
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
          tone={urlResultTone(result)}
          title={`Результат: ${result.score} из ${result.maxScore}${
            result.saved || result.score >= 9
              ? " — отлично"
              : result.passed
                ? " — зачёт по критериям"
                : result.score >= 7
                  ? " — почти зачёт"
                  : " — нужно доработать"
          }`}
          feedback={result.feedback}
          footer={
            result.saved ? (
              <p className="text-xs font-medium text-success">Ответ зафиксирован в журнале отправок.</p>
            ) : result.passed && !result.saved ? (
              <p className="text-xs text-muted-foreground">
                Для автоматического сохранения зачёта наберите не менее 9 баллов по ссылкам и корректное объяснение.
              </p>
            ) : null
          }
        />
      ) : null}
    </div>
  );
}
