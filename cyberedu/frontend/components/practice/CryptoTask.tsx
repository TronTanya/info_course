"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  CRYPTO_B64_STRING,
  CRYPTO_CAESAR_CIPHER,
  CRYPTO_CAESAR_SHIFT,
  CRYPTO_HASH_A,
  CRYPTO_HASH_B,
  CRYPTO_HASH_MEANING_MIN,
} from "@/lib/crypto-beginner-score";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CheckResponse = {
  score: number;
  maxScore: number;
  passed: boolean;
  feedback: string;
  explanations?: { caesar: string; base64: string; hash: string };
  saved?: boolean;
};

export type CryptoTaskProps = {
  moduleId: string;
  practicalTaskId: string;
  disabled?: boolean;
  onResult: (error: string | null, success: string | null) => void;
};

export function CryptoTask({ moduleId, practicalTaskId, disabled, onResult }: CryptoTaskProps) {
  const [caesar, setCaesar] = useState("");
  const [b64, setB64] = useState("");
  const [hashSame, setHashSame] = useState<boolean | null>(null);
  const [hashMeaning, setHashMeaning] = useState("");
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const formComplete = useMemo(() => {
    return (
      caesar.trim().length > 0 &&
      b64.trim().length > 0 &&
      hashSame !== null &&
      hashMeaning.trim().length >= CRYPTO_HASH_MEANING_MIN
    );
  }, [caesar, b64, hashSame, hashMeaning]);

  const runCheck = useCallback(() => {
    setFetchError(null);
    onResult(null, null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/practice/crypto/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            moduleId,
            practicalTaskId,
            caesar,
            b64,
            hashSame,
            hashMeaning,
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
          explanations: data.explanations,
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
  }, [moduleId, practicalTaskId, onResult, caesar, b64, hashSame, hashMeaning]);

  const canRetry = checked && result && !result.saved;

  function resetAttempt() {
    setChecked(false);
    setResult(null);
    setCaesar("");
    setB64("");
    setHashSame(null);
    setHashMeaning("");
    setFetchError(null);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-500/25 bg-sky-500/5 px-3 py-2 text-xs text-muted-foreground">
        <span>
          Учебные примеры без атак на пароли и без перебора. Вы вручную применяете сдвиг, декодируете Base64 и
          интерпретируете готовые хеши — как в вводном курсе по ИБ.
        </span>
        <Badge variant="cyan" className="shrink-0">
          Только обучение
        </Badge>
      </div>

      {/* 1. Caesar */}
      <section className="space-y-3 rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-foreground">1. Шифр Цезаря (латиница)</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Зашифрованный текст:{" "}
          <span className="font-mono text-foreground">{CRYPTO_CAESAR_CIPHER}</span>. Сдвиг при шифровании:{" "}
          <span className="font-mono">{CRYPTO_CAESAR_SHIFT}</span> (буква сдвинута вперёд в алфавите A–Z). Введите
          расшифрованное слово латиницей.
        </p>
        <Input
          label="Расшифрованный ответ"
          hint="Регистр при проверке не важен."
          value={caesar}
          onChange={(e) => setCaesar(e.target.value)}
          disabled={disabled || checked}
          autoComplete="off"
          spellCheck={false}
        />
      </section>

      {/* 2. Base64 */}
      <section className="space-y-3 rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-foreground">2. Base64</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Строка в кодировке Base64:{" "}
          <span className="break-all font-mono text-[13px] text-foreground">{CRYPTO_B64_STRING}</span>. Введите
          декодированный текст (латиница).
        </p>
        <Input
          label="Результат декодирования"
          hint="Пробелы по краям и регистр будут нормализованы при проверке."
          value={b64}
          onChange={(e) => setB64(e.target.value)}
          disabled={disabled || checked}
          autoComplete="off"
          spellCheck={false}
        />
      </section>

      {/* 3. Hash */}
      <section className="space-y-3 rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-foreground">3. Сравнение хешей SHA-256</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ниже два учебных отпечатка (hex). Определите, совпадают ли они, и кратко объясните, что означает ваш выбор
          (например, про разные входные данные или про контроль целостности).
        </p>
        <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3 text-xs font-mono break-all text-foreground/95">
          <p>
            <span className="text-muted-foreground">A: </span>
            {CRYPTO_HASH_A}
          </p>
          <p>
            <span className="text-muted-foreground">B: </span>
            {CRYPTO_HASH_B}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            disabled={disabled || checked}
            onClick={() => setHashSame(true)}
            className={cn(
              "rounded-lg border px-3 py-1.5 font-medium transition-colors",
              hashSame === true
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border bg-card hover:bg-muted/50",
            )}
          >
            Совпадают
          </button>
          <button
            type="button"
            disabled={disabled || checked}
            onClick={() => setHashSame(false)}
            className={cn(
              "rounded-lg border px-3 py-1.5 font-medium transition-colors",
              hashSame === false
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border bg-card hover:bg-muted/50",
            )}
          >
            Не совпадают
          </button>
        </div>
        <Textarea
          label="Что это значит?"
          hint={`Не менее ${CRYPTO_HASH_MEANING_MIN} символов. Упомяните, например, «разные», «хеш», «совпад» или «контрол».`}
          value={hashMeaning}
          onChange={(e) => setHashMeaning(e.target.value)}
          rows={4}
          disabled={disabled || checked}
        />
      </section>

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
        <div
          className={cn(
            "space-y-3 rounded-xl border px-4 py-3 text-sm",
            result.saved
              ? "border-emerald-500/40 bg-emerald-500/10"
              : result.passed
                ? "border-sky-500/40 bg-sky-500/10"
                : "border-amber-500/35 bg-amber-500/8",
          )}
        >
          <p className="font-semibold text-foreground">
            Результат: {result.score} из {result.maxScore}
            {result.saved ? " — зачёт" : result.passed ? " — допуск по курсу" : " — повторите задание"}
          </p>
          <p className="text-muted-foreground">{result.feedback}</p>
          {result.explanations ? (
            <div className="border-t border-border pt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground">Учебные пояснения</p>
              <p>
                <span className="font-medium text-foreground">Цезарь: </span>
                {result.explanations.caesar}
              </p>
              <p>
                <span className="font-medium text-foreground">Base64: </span>
                {result.explanations.base64}
              </p>
              <p>
                <span className="font-medium text-foreground">Хеши: </span>
                {result.explanations.hash}
              </p>
            </div>
          ) : null}
          {result.saved ? (
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Ответ зафиксирован в журнале отправок.</p>
          ) : result.passed && !result.saved ? (
            <p className="text-xs text-muted-foreground">
              Для автоматического сохранения зачёта нужны все три верных ответа и осмысленное пояснение к хешам.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
