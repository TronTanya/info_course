"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { submitTestAttemptAction } from "@/lib/actions/test";
import type { ClientTestQuestion, SubmittedAnswerPayload } from "@/lib/test-grading";
import { computeTestMaxScore, estimateTestMinutes } from "@/lib/test-ui";
import { TestExitDialog } from "@/components/test/test-exit-dialog";
import { TestStartScreen } from "@/components/test/test-start-screen";
import { TestResultView, type TestReviewRow } from "@/components/test/test-result-view";
import { TestTakingView, type TestLocalAnswers } from "@/components/test/test-taking-view";
import type { LearningStepLink } from "@/lib/learning-nav";
import { useTestBeforeUnload } from "@/lib/hooks/use-test-session-guards";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { useToast } from "@/components/ui/toast";
import { LearnEnter } from "@/components/learn/learn-chrome";
import { useFormDraft } from "@/lib/hooks/use-form-draft";
import { formatUserFacingError } from "@/lib/ux/format-user-error";
import { AiMentorChat } from "@/components/ai/AiMentorChat";
import { formatMentorTestSummary } from "@/lib/ai/mentor-ui/test-summary";

export type ModuleTestRunnerProps = {
  moduleId: string;
  moduleTitle: string;
  moduleOrderNumber: number;
  testId: string;
  title: string;
  minScore: number;
  questions: ClientTestQuestion[];
  lastAttempt: { score: number; maxScore: number; passed: boolean; percent: number; createdAt: string } | null;
  nextStep?: LearningStepLink | null;
};

type Phase = "lobby" | "active" | "result";

function emptyLocal(questions: ClientTestQuestion[]): TestLocalAnswers {
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

function buildPayload(questions: ClientTestQuestion[], local: TestLocalAnswers): SubmittedAnswerPayload[] {
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

function isQuestionFilled(q: ClientTestQuestion, local: TestLocalAnswers): boolean {
  if (q.questionType === "MULTIPLE_CHOICE" || q.questionType === "MATCHING") return (local.multi[q.id]?.length ?? 0) > 0;
  if (q.questionType === "TEXT") return Boolean(local.text[q.id]?.trim());
  return Boolean(local.single[q.id]);
}

export function ModuleTestRunner({
  moduleId,
  moduleTitle,
  moduleOrderNumber,
  testId,
  title,
  minScore,
  questions,
  lastAttempt,
  nextStep = null,
}: ModuleTestRunnerProps) {
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("lobby");
  const [idx, setIdx] = useState(0);
  const [local, setLocal] = useState<TestLocalAnswers>(() => emptyLocal(questions));
  const [submitOpen, setSubmitOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    maxScore: number;
    passed: boolean;
    percent: number;
    correctCount: number;
    review: TestReviewRow[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mentorOpenSeq, setMentorOpenSeq] = useState(0);
  const [pending, startTransition] = useTransition();
  const submitIdempotencyKey = useRef(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `submit-${Date.now()}`,
  );

  const questionCount = questions.length;
  const estimatedMinutes = estimateTestMinutes(questionCount);
  const maxScore = useMemo(() => computeTestMaxScore(questions), [questions]);
  const filledAll = useMemo(() => questions.every((qq) => isQuestionFilled(qq, local)), [questions, local]);
  const answeredCount = useMemo(
    () => questions.filter((qq) => isQuestionFilled(qq, local)).length,
    [questions, local],
  );
  const answeredFlags = useMemo(
    () => questions.map((qq) => isQuestionFilled(qq, local)),
    [questions, local],
  );
  const totalGraded = useMemo(
    () => questions.filter((q) => !(q.questionType === "TEXT" && q.manualTextGrading)).length,
    [questions],
  );

  const draftEnabled = phase === "active";
  const isDraftDirty = draftEnabled && answeredCount > 0;

  const restoreDraft = useCallback((saved: TestLocalAnswers) => {
    setLocal(saved);
  }, []);

  useTestBeforeUnload(phase === "active" && answeredCount > 0);

  const { clearDraft } = useFormDraft({
    storageKey: `ce-test-draft:${moduleId}:${testId}`,
    value: local,
    onRestore: restoreDraft,
    isDirty: isDraftDirty,
    enabled: draftEnabled,
  });

  function newSubmitIdempotencyKey() {
    submitIdempotencyKey.current =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `submit-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function startTest() {
    newSubmitIdempotencyKey();
    setPhase("active");
    setIdx(0);
    setError(null);
    setResult(null);
  }

  function resetToLobby() {
    newSubmitIdempotencyKey();
    clearDraft();
    setPhase("lobby");
    setIdx(0);
    setLocal(emptyLocal(questions));
    setResult(null);
    setError(null);
    setSubmitOpen(false);
  }

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
      setSubmitOpen(false);
      return;
    }
    const payload = buildPayload(questions, local);
    startTransition(async () => {
      const res = await submitTestAttemptAction({
        moduleId,
        testId,
        answers: payload,
        idempotencyKey: submitIdempotencyKey.current,
      });
      if (!res.ok) {
        setError(formatUserFacingError(res.error));
        setSubmitOpen(false);
        return;
      }
      clearDraft();
      setSubmitOpen(false);
      setResult({
        score: res.score,
        maxScore: res.maxScore,
        passed: res.passed,
        percent: res.percent,
        correctCount: res.correctCount,
        review: res.review,
      });
      setPhase("result");
      toast({
        title: res.passed ? "Тест пройден" : "Ответы отправлены",
        description: res.passed ? "Можно перейти к практике модуля." : "См. рекомендации в результате.",
        variant: res.passed ? "success" : "info",
      });
    });
  }

  if (questionCount === 0) {
    return (
      <SectionCard variant="lab">
        <EmptyState
          title="Вопросов пока нет"
          description="Администратор ещё не добавил вопросы в этот тест. Пока можно вернуться к лекции модуля."
          action={
            <Button asChild variant="outline">
              <Link href={`/dashboard/course/${moduleId}`}>К модулю</Link>
            </Button>
          }
        />
      </SectionCard>
    );
  }

  if (phase === "lobby") {
    return (
      <div className="space-y-4">
        <TestStartScreen
          title={title}
          moduleTitle={moduleTitle}
          moduleOrderNumber={moduleOrderNumber}
          questionCount={questionCount}
          estimatedMinutes={estimatedMinutes}
          minScore={minScore}
          maxScore={maxScore}
          lastAttempt={lastAttempt}
          onStart={startTest}
        />
        {lastAttempt?.passed ? (
          <div className="flex flex-col gap-3">
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href={`/dashboard/course/${moduleId}/practice`}>Перейти к практике</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="w-full">
              <Link href={`/dashboard/course/${moduleId}`}>К модулю</Link>
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  if (phase === "result" && result) {
    const testSummary = formatMentorTestSummary({
      title,
      percent: result.percent,
      passed: result.passed,
      correctCount: result.correctCount,
      totalGraded,
    });

    return (
      <LearnEnter>
        <TestResultView
          moduleId={moduleId}
          title={title}
          score={result.score}
          maxScore={result.maxScore}
          percent={result.percent}
          passed={result.passed}
          correctCount={result.correctCount}
          totalGraded={totalGraded}
          review={result.review}
          nextStep={nextStep}
          onRetry={resetToLobby}
          onAskMentor={() => setMentorOpenSeq((n) => n + 1)}
        />
        <AiMentorChat
          moduleId={moduleId}
          openSignal={mentorOpenSeq}
          contextLabels={{
            moduleTitle,
            topic: moduleTitle,
            testSummary,
          }}
        />
      </LearnEnter>
    );
  }

  return (
    <LearnEnter>
      <div className="relative">
        <TestTakingView
          title={title}
          minScore={minScore}
          maxScore={maxScore}
          questions={questions}
          idx={idx}
          local={local}
          error={error}
          pending={pending}
          answeredCount={answeredCount}
          answeredFlags={answeredFlags}
          submitOpen={submitOpen}
          onSubmitOpenChange={setSubmitOpen}
          onIndexChange={setIdx}
          onSingle={(qid, aid) => setLocal((p) => ({ ...p, single: { ...p.single, [qid]: aid } }))}
          onMultiToggle={toggleMulti}
          onText={(qid, text) => setLocal((p) => ({ ...p, text: { ...p.text, [qid]: text } }))}
          onRequestFinish={() => {
            setError(null);
            setSubmitOpen(true);
          }}
          onConfirmSubmit={submit}
          onRetrySubmit={() => {
            setError(null);
            setSubmitOpen(true);
          }}
          draftNote={isDraftDirty}
        />
        <TestExitDialog
          open={exitOpen}
          onOpenChange={setExitOpen}
          answeredCount={answeredCount}
          total={questionCount}
          onConfirmExit={() => {
            setExitOpen(false);
            resetToLobby();
          }}
        />
        {pending ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-background/75 backdrop-blur-sm">
            <LoadingState size="sm" label="Проверка ответов…" terminalLine="assessment --grade" className="border-0 bg-transparent shadow-none ring-0" />
          </div>
        ) : null}
      </div>
      <div className="mt-4">
        <Button type="button" variant="ghost" size="md" disabled={pending} onClick={() => setExitOpen(true)}>
          Выйти из теста
        </Button>
      </div>
    </LearnEnter>
  );
}
