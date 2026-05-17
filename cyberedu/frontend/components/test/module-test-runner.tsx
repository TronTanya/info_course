"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";
import { submitTestAttemptAction } from "@/lib/actions/test";
import type { ClientTestQuestion, SubmittedAnswerPayload } from "@/lib/test-grading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFeedback } from "@/components/ui/form-feedback";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useToast } from "@/components/ui/toast";
import { LearnEnter } from "@/components/learn/learn-chrome";
import { useFormDraft } from "@/lib/hooks/use-form-draft";
import { cn } from "@/lib/utils";
import type { QuestionType } from "@prisma/client";

export type ModuleTestRunnerProps = {
  moduleId: string;
  testId: string;
  title: string;
  minScore: number;
  questions: ClientTestQuestion[];
  /** Последняя попытка (для экрана «уже сдано» / повтор) */
  lastAttempt: { score: number; maxScore: number; passed: boolean; percent: number; createdAt: string } | null;
};

type LocalAnswers = {
  single: Record<string, string | null>;
  multi: Record<string, string[]>;
  text: Record<string, string>;
};

function emptyLocal(questions: ClientTestQuestion[]): LocalAnswers {
  const single: Record<string, string | null> = {};
  const multi: Record<string, string[]> = {};
  const text: Record<string, string> = {};
  for (const q of questions) {
    if (q.questionType === "MULTIPLE_CHOICE" || q.questionType === "MATCHING") multi[q.id] = [];
    else if (q.questionType === "TEXT") text[q.id] = "";
    else single[q.id] = null;
  }
  return { single, multi, text };
}

function buildPayload(questions: ClientTestQuestion[], local: LocalAnswers): SubmittedAnswerPayload[] {
  return questions.map((q) => {
    if (q.questionType === "MULTIPLE_CHOICE" || q.questionType === "MATCHING") {
      return { questionId: q.id, kind: "multi", answerIds: local.multi[q.id] ?? [] };
    }
    if (q.questionType === "TEXT") {
      return { questionId: q.id, kind: "text", text: local.text[q.id] ?? "" };
    }
    return { questionId: q.id, kind: "single", answerId: local.single[q.id] ?? null };
  });
}

function isQuestionFilled(q: ClientTestQuestion, local: LocalAnswers): boolean {
  if (q.questionType === "MULTIPLE_CHOICE" || q.questionType === "MATCHING") return (local.multi[q.id]?.length ?? 0) > 0;
  if (q.questionType === "TEXT") return Boolean(local.text[q.id]?.trim());
  return Boolean(local.single[q.id]);
}

function typeLabel(t: QuestionType): string {
  switch (t) {
    case "SINGLE_CHOICE":
      return "Один вариант";
    case "MULTIPLE_CHOICE":
      return "Несколько вариантов";
    case "TRUE_FALSE":
      return "Верно / неверно";
    case "TEXT":
      return "Текстовый ответ";
    case "SITUATION":
      return "Ситуация";
    case "MATCHING":
      return "Сопоставление";
    default:
      return String(t);
  }
}

export function ModuleTestRunner({ moduleId, testId, title, minScore, questions, lastAttempt }: ModuleTestRunnerProps) {
  const { toast } = useToast();
  const [retaking, setRetaking] = useState(false);
  const [idx, setIdx] = useState(0);
  const [local, setLocal] = useState<LocalAnswers>(() => emptyLocal(questions));
  const [result, setResult] = useState<{
    score: number;
    maxScore: number;
    passed: boolean;
    percent: number;
    review: { questionId: string; questionText: string; explanation: string | null }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const total = questions.length;
  const q = questions[idx];
  const filledAll = useMemo(() => questions.every((qq) => isQuestionFilled(qq, local)), [questions, local]);

  const showPassedGate = Boolean(lastAttempt?.passed) && !retaking && !result;

  const answeredCount = useMemo(
    () => questions.filter((qq) => isQuestionFilled(qq, local)).length,
    [questions, local],
  );
  const draftEnabled = !showPassedGate && !result;
  const isDraftDirty = draftEnabled && answeredCount > 0;

  const restoreDraft = useCallback((saved: LocalAnswers) => {
    setLocal(saved);
  }, []);

  const { clearDraft } = useFormDraft({
    storageKey: `ce-test-draft:${moduleId}:${testId}`,
    value: local,
    onRestore: restoreDraft,
    isDirty: isDraftDirty,
    enabled: draftEnabled,
  });

  function toggleMulti(qid: string, aid: string) {
    setLocal((prev) => {
      const cur = prev.multi[qid] ?? [];
      const next = cur.includes(aid) ? cur.filter((x) => x !== aid) : [...cur, aid];
      return { ...prev, multi: { ...prev.multi, [qid]: next } };
    });
  }

  function submit() {
    setError(null);
    if (!filledAll) {
      setError("Ответьте на все вопросы.");
      return;
    }
    const payload = buildPayload(questions, local);
    startTransition(async () => {
      const res = await submitTestAttemptAction({ moduleId, testId, answers: payload });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      clearDraft();
      setResult({
        score: res.score,
        maxScore: res.maxScore,
        passed: res.passed,
        percent: res.percent,
        review: res.review,
      });
      toast({
        title: res.passed ? "Тест пройден" : "Ответы отправлены",
        description: res.passed
          ? "Можно перейти к практике модуля."
          : "Результат сохранён — при необходимости попробуйте снова.",
        variant: res.passed ? "success" : "info",
      });
    });
  }

  if (showPassedGate) {
    const a = lastAttempt!;
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Тест уже пройден. Практика модуля доступна.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResultBlock score={a.score} maxScore={a.maxScore} passed={a.passed} percent={a.percent} />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button asChild variant="primary" className="w-full sm:w-auto">
              <Link href={`/dashboard/course/${moduleId}/practice`}>Перейти к практике</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                clearDraft();
                setRetaking(true);
              }}
            >
              Пройти тест ещё раз
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Результат: {title}</CardTitle>
          <CardDescription>
            Правильные варианты по каждому вопросу не показываются — ориентируйтесь на рекомендации ниже.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResultBlock score={result.score} maxScore={result.maxScore} passed={result.passed} percent={result.percent} />
          <Recommendations passed={result.passed} />
          {result.review.length > 0 ? (
            <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">Короткие пояснения к вопросам</p>
              <p className="text-xs text-muted-foreground">
                Здесь нет отметки «верно/неверно» по каждому пункту — только идеи для повторения материала.
              </p>
              <ul className="max-h-80 space-y-3 overflow-y-auto text-sm">
                {result.review.map((row) => (
                  <li key={row.questionId} className="border-b border-border/60 pb-2 last:border-0">
                    <p className="font-medium text-foreground">{row.questionText}</p>
                    {row.explanation ? <p className="mt-1 text-muted-foreground">{row.explanation}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {result.passed ? (
              <Button asChild variant="primary" className="w-full sm:w-auto">
                <Link href={`/dashboard/course/${moduleId}/practice`}>Перейти к практике</Link>
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                className="w-full sm:w-auto"
                onClick={() => {
                  clearDraft();
                  setResult(null);
                  setIdx(0);
                  setLocal(emptyLocal(questions));
                  setError(null);
                }}
              >
                Попробовать снова
              </Button>
            )}
            <Button asChild variant="ghost" className="w-full sm:w-auto">
              <Link href={`/dashboard/course/${moduleId}`}>К модулю</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!q || total === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-muted-foreground">В этом тесте пока нет вопросов.</CardContent>
      </Card>
    );
  }

  return (
    <LearnEnter>
    <Card interactive className="ce-quiz-shell ce-border-beam overflow-hidden">
      <CardHeader
        className={cn(
          "space-y-2 border-b border-border/60 bg-linear-to-r from-card via-muted/20 to-card",
          "max-md:sticky max-md:top-14 max-md:z-20 max-md:border-b max-md:border-border max-md:bg-card/95 max-md:pb-3 max-md:backdrop-blur-sm max-md:shadow-sm",
        )}
      >
        <CardTitle className="typo-h2">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Проходной балл: <span className="font-medium text-foreground">{minScore}</span> из максимума по вопросам
          (с учётом только автоматически оцениваемых вопросов).
          <br />
          Тип вопроса: {typeLabel(q.questionType)} · {q.points} балл(ов).
          {q.manualTextGrading ? (
            <span className="mt-1 block text-xs text-muted-foreground">
              Этот ответ проверяется вручную и не входит в автоматический проходной балл.
            </span>
          ) : null}
        </CardDescription>
        <ProgressBar label={`Вопрос ${idx + 1} из ${total}`} value={idx + 1} max={total} />
      </CardHeader>
      <CardContent className="space-y-6">
        <FormFeedback message={error} />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Вопрос {idx + 1}</p>
          <p className="mt-2 text-base leading-relaxed text-foreground sm:text-lg">{q.questionText}</p>
        </div>

        {q.questionType === "TEXT" ? (
          <label className="block space-y-2 text-sm">
            <span className="font-medium text-foreground">Ваш ответ</span>
            <textarea
              className={cn(
                "min-h-[120px] w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-card-foreground shadow-sm",
                "placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              value={local.text[q.id] ?? ""}
              onChange={(e) => setLocal((p) => ({ ...p, text: { ...p.text, [q.id]: e.target.value } }))}
              rows={5}
              maxLength={8000}
            />
          </label>
        ) : q.questionType === "MULTIPLE_CHOICE" || q.questionType === "MATCHING" ? (
          <ul className="space-y-3">
            {q.answers.map((a) => {
              const checked = local.multi[q.id]?.includes(a.id) ?? false;
              return (
                <li key={a.id}>
                  <label className="ce-quiz-option flex min-h-[52px] w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-base leading-snug has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
                    <input
                      type="checkbox"
                      className="mt-1 size-5 shrink-0 rounded border-border"
                      checked={checked}
                      onChange={() => toggleMulti(q.id, a.id)}
                    />
                    <span className="text-pretty pt-0.5">{a.answerText}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="space-y-3">
            {q.answers.map((a) => (
              <li key={a.id}>
                <label className="ce-quiz-option flex min-h-[52px] w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-base leading-snug has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
                  <input
                    type="radio"
                    className="mt-1 size-5 shrink-0"
                    name={`q-${q.id}`}
                    checked={local.single[q.id] === a.id}
                    onChange={() => setLocal((p) => ({ ...p, single: { ...p.single, [q.id]: a.id } }))}
                  />
                  <span className="text-pretty pt-0.5">{a.answerText}</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Button type="button" variant="outline" className="w-full min-h-11 sm:w-auto" disabled={idx <= 0 || pending} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
            Назад
          </Button>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            <Button type="button" variant="secondary" className="w-full min-h-11 sm:w-auto" disabled={idx >= total - 1 || pending} onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}>
              Следующий вопрос
            </Button>
            <Button
              type="button"
              variant="primary"
              className="w-full min-h-11 sm:w-auto"
              loading={pending}
              disabled={!filledAll || pending}
              onClick={() => submit()}
            >
              Завершить тест
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 sm:inline-block">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            Прогресс по ответам: <span className="font-semibold tabular-nums text-foreground">{questions.filter((qq) => isQuestionFilled(qq, local)).length}</span> / {total}
          </p>
        </div>
      </CardContent>
    </Card>
    </LearnEnter>
  );
}

function ResultBlock({
  score,
  maxScore,
  passed,
  percent,
}: {
  score: number;
  maxScore: number;
  passed: boolean;
  percent: number;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-foreground">{score}</span>
        <span className="text-muted-foreground">/ {maxScore} баллов</span>
        <span className="text-sm text-muted-foreground">({percent}%)</span>
      </div>
      <p className={cn("text-sm font-medium", passed ? "text-success" : "text-danger")}>
        {passed ? "Статус: пройден" : "Статус: не пройден"}
      </p>
    </div>
  );
}

function Recommendations({ passed }: { passed: boolean }) {
  if (passed) {
    return (
      <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
        <li>Отличная работа. Закрепите материал на практике модуля.</li>
      </ul>
    );
  }
  return (
    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
      <li>Повторите лекцию и обратите внимание на ключевые определения.</li>
      <li>Попробуйте пройти тест ещё раз после повторения материала.</li>
    </ul>
  );
}
