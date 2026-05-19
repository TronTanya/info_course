"use client";

import { useCallback, useState, useTransition, type ReactNode } from "react";
import { PHISHING_EMAIL_ELEMENT_IDS, type PhishingEmailElementId } from "@/lib/phishing-email-score";
import { Button } from "@/components/ui/button";
import {
  PracticeEmailPanel,
  PracticeTaskHint,
  PracticeTaskResult,
  practiceChipClass,
  type PracticeResultTone,
} from "@/components/practice/practice-task-ui";

type CheckResponse = {
  score: number;
  maxScore: number;
  passed: boolean;
  feedback: string;
  saved?: boolean;
};

const LABELS: Record<PhishingEmailElementId, string> = {
  sender: "Подозрительный адрес отправителя",
  urgency: "Срочность в теме письма",
  suspicious_link: "Подозрительная ссылка",
  password_request: "Просьба ввести пароль",
  threat_block: "Угроза блокировки",
};

function scoreTone(score: number): PracticeResultTone {
  if (score >= 5) return "success";
  if (score === 4) return "good";
  if (score === 3) return "retry";
  return "fail";
}

export type PhishingEmailTaskProps = {
  moduleId: string;
  practicalTaskId: string;
  disabled?: boolean;
  onResult: (error: string | null, success: string | null) => void;
};

export function PhishingEmailTask({ moduleId, practicalTaskId, disabled, onResult }: PhishingEmailTaskProps) {
  const [picked, setPicked] = useState<Set<PhishingEmailElementId>>(() => new Set());
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = useCallback(
    (id: PhishingEmailElementId) => {
      if (disabled || checked) return;
      setPicked((prev) => {
        const n = new Set(prev);
        if (n.has(id)) n.delete(id);
        else n.add(id);
        return n;
      });
    },
    [disabled, checked],
  );

  const runCheck = useCallback(() => {
    setFetchError(null);
    onResult(null, null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/practice/phishing/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleId,
            practicalTaskId,
            selectedElements: [...picked],
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
  }, [moduleId, practicalTaskId, onResult, picked]);

  const canRetry = checked && result && !result.saved && result.score < 4;

  function resetAttempt() {
    setChecked(false);
    setResult(null);
    setPicked(new Set());
    setFetchError(null);
  }

  const locked = Boolean(disabled || checked);

  const chip = (id: PhishingEmailElementId, children: ReactNode, className?: string) => (
    <button
      type="button"
      disabled={locked}
      onClick={() => toggle(id)}
      aria-pressed={picked.has(id)}
      className={practiceChipClass(picked.has(id), locked, className)}
      title={LABELS[id]}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-5">
      <PracticeEmailPanel header="Учебное письмо" badge="Имитация · без реальных сервисов">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
          <span className="font-medium text-muted-foreground">От кого:</span>
          {chip("sender", <span className="font-mono text-[13px] sm:text-sm">security@colledge-support.ru</span>)}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
          <span className="font-medium text-muted-foreground">Тема:</span>
          {chip("urgency", <span className="font-semibold text-foreground">Срочно подтвердите аккаунт</span>)}
        </div>

        <div className="border-t border-border pt-4 text-sm leading-relaxed text-foreground/95">
          <p>
            {chip("threat_block", <>Ваш аккаунт будет заблокирован через 15 минут.</>)}
            {" Перейдите по ссылке и "}
            {chip("password_request", <>подтвердите логин и пароль</>)}.
          </p>
          <p className="mt-4 text-xs font-medium text-muted-foreground">Ссылка</p>
          <p className="mt-1 break-all font-mono text-[13px]">
            {chip(
              "suspicious_link",
              <span className="underline decoration-dotted underline-offset-2">http://college-login-security.example.com</span>,
            )}
          </p>
        </div>
      </PracticeEmailPanel>

      <PracticeTaskHint title="Как выполнить задание">
        <p>
          Кликните по подозрительным фрагментам письма (они подсветятся). Можно выбрать несколько раз по одному и тому же
          признаку, чтобы снять выделение. Затем нажмите «Проверить». Используются только вымышленные адреса и домены
          вида <span className="font-mono">example.com</span>.
        </p>
        <ul className="mt-2 list-inside list-disc space-y-0.5">
          {(PHISHING_EMAIL_ELEMENT_IDS as readonly PhishingEmailElementId[]).map((id) => (
            <li key={id}>{LABELS[id]}</li>
          ))}
        </ul>
      </PracticeTaskHint>

      <div className="flex flex-wrap gap-2">
        <Button type="button" loading={pending} disabled={disabled || picked.size === 0 || checked} onClick={runCheck}>
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
          tone={scoreTone(result.score)}
          title={`Результат: ${result.score} из ${result.maxScore}${
            result.score === 5
              ? " — отлично"
              : result.score === 4
                ? " — хорошо"
                : result.score === 3
                  ? " — нужно повторить тему"
                  : " — задание не зачтено"
          }`}
          feedback={result.feedback}
          footer={
            result.saved ? (
              <p className="text-xs font-medium text-success">Ответ зафиксирован в журнале отправок.</p>
            ) : result.score >= 3 && result.score < 4 ? (
              <p className="text-xs text-muted-foreground">
                Попробуйте снова: при 4–5 баллах зачёт сохраняется автоматически.
              </p>
            ) : null
          }
        />
      ) : null}
    </div>
  );
}
