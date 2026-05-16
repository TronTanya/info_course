"use client";

import { useCallback, useState, useTransition, type ReactNode } from "react";
import { PHISHING_EMAIL_ELEMENT_IDS, type PhishingEmailElementId } from "@/lib/phishing-email-score";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export type PhishingEmailTaskProps = {
  moduleId: string;
  practicalTaskId: string;
  /** Блокировка при ожидании проверки другой работы и т.п. */
  disabled?: boolean;
  onResult: (error: string | null, success: string | null) => void;
};

export function PhishingEmailTask({ moduleId, practicalTaskId, disabled, onResult }: PhishingEmailTaskProps) {
  const [picked, setPicked] = useState<Set<PhishingEmailElementId>>(() => new Set());
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = useCallback((id: PhishingEmailElementId) => {
    if (disabled || checked) return;
    setPicked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, [disabled, checked]);

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

  const chip = (id: PhishingEmailElementId, children: ReactNode, className?: string) => {
    const on = picked.has(id);
    return (
      <button
        type="button"
        disabled={disabled || checked}
        onClick={() => toggle(id)}
        aria-pressed={on}
        className={cn(
          "rounded-md px-1 py-0.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
          on
            ? "bg-emerald-500/20 text-emerald-100 ring-2 ring-emerald-500/70"
            : "bg-transparent text-inherit hover:bg-white/10",
          checked ? "cursor-default opacity-90" : "cursor-pointer",
          className,
        )}
        title={LABELS[id]}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-muted/20 shadow-card">
        <div className="border-b border-border bg-muted/40 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Учебное письмо</p>
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-200">
              Имитация · без реальных сервисов
            </span>
          </div>
        </div>

        <div className="space-y-4 px-4 py-5 sm:px-6">
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
              {chip(
                "threat_block",
                <>Ваш аккаунт будет заблокирован через 15 минут.</>,
              )}
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
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Как выполнить задание</p>
        <p className="mt-1">
          Кликните по подозрительным фрагментам письма (они подсветятся). Можно выбрать несколько раз по одному и тому же
          признаку, чтобы снять выделение. Затем нажмите «Проверить». Используются только вымышленные адреса и домены
          вида <span className="font-mono">example.com</span>.
        </p>
        <ul className="mt-2 list-inside list-disc space-y-0.5">
          {(PHISHING_EMAIL_ELEMENT_IDS as readonly PhishingEmailElementId[]).map((id) => (
            <li key={id}>{LABELS[id]}</li>
          ))}
        </ul>
      </div>

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
        <div
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            result.score === 5
              ? "border-emerald-500/40 bg-emerald-500/10"
              : result.score === 4
                ? "border-sky-500/40 bg-sky-500/10"
                : result.score === 3
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-destructive/30 bg-destructive/5",
          )}
        >
          <p className="font-semibold text-foreground">
            Результат: {result.score} из {result.maxScore}{" "}
            {result.score === 5 ? "— отлично" : result.score === 4 ? "— хорошо" : result.score === 3 ? "— нужно повторить тему" : "— задание не зачтено"}
          </p>
          <p className="mt-2 text-muted-foreground">{result.feedback}</p>
          {result.saved ? (
            <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">Ответ зафиксирован в журнале отправок.</p>
          ) : result.score >= 3 && result.score < 4 ? (
            <p className="mt-2 text-xs text-muted-foreground">Попробуйте снова: при 4–5 баллах зачёт сохраняется автоматически.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
