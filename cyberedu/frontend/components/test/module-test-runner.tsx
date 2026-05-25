"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";
import type { ClientTestQuestion } from "@/lib/test-grading";
import { computeTestMaxScore, estimateTestMinutes } from "@/lib/test-ui";
import {
  buildTestAnsweredFlags,
  countTestAnswered,
  emptyTestLocalAnswers,
  isTestQuestionFilled,
  testDraftStorageKey,
  type TestLocalAnswers,
} from "@/lib/test-taking";
import { buildTestSubmitPayload } from "@/lib/test-submit-payload";
import { submitTestAttemptClient } from "@/lib/test-submit-client";
import { TestExitDialog } from "@/components/test/test-exit-dialog";
import { TestIntroScreen } from "@/components/test/test-intro-screen";
import { TestResultScreen, type TestReviewRow } from "@/components/test/test-result-screen";
import { TestTakingScreen } from "@/components/test/test-taking-screen";
import type { LearningStepLink } from "@/lib/learning-nav";
import type { TestPageLearningContext } from "@/lib/test-next-learning-step";
import type { TestModulePathStep } from "@/components/test/test-module-path-strip";
import { useTestBeforeUnload } from "@/lib/hooks/use-test-session-guards";
import { useTestOpenedFlags } from "@/lib/hooks/use-test-opened-flags";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";
import { LearnEnter } from "@/components/learn/learn-chrome";
import { useFormDraft } from "@/lib/hooks/use-form-draft";
import { formatUserFacingError } from "@/lib/ux/format-user-error";
import { AiMentorChatLazy as AiMentorChat } from "@/components/ai/ai-mentor-chat-lazy";
import type { MentorModeId } from "@/lib/ai/mentor-ui/modes";
import { buildMentorTestDebriefHint } from "@/lib/ai/mentor-ui/test-debrief";
import { formatMentorTestSummary } from "@/lib/ai/mentor-ui/test-summary";
import { buildTestResultAIMentorContextInput } from "@/lib/test-mentor-ai-context";
import {
  buildTestMentorSafeContext,
  testMentorContextLabels,
} from "@/lib/test-mentor-panel";
import { buildTestResultViewModel } from "@/lib/test-view-mapper";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { trackAnalyticsEvent } from "@/lib/analytics/track";
import { resolveTestIntroState } from "@/lib/test-intro";
import { resolveTestCanRetry } from "@/lib/test-retry";
import { TestPageEmptyState } from "@/components/test/test-page-states";
import {
  resolveTestClientErrorDisplay,
  sanitizeTestUserMessage,
} from "@/lib/test-page-state";

export type ModuleTestRunnerProps = {
  moduleId: string;
  moduleTitle: string;
  moduleOrderNumber: number;
  moduleDescription?: string | null;
  attemptCount?: number;
  maxAttempts?: number | null;
  testId: string;
  title: string;
  minScore: number;
  questions: ClientTestQuestion[];
  lastAttempt: { score: number; maxScore: number; passed: boolean; percent: number; createdAt: string } | null;
  nextStep?: LearningStepLink | null;
  modulePathSteps?: TestModulePathStep[];
  timeLimitMinutes?: number | null;
  /** false — навигация только «Назад» / «Далее», без перехода по номерам */
  allowFreeNavigation?: boolean;
  learning: TestPageLearningContext;
  aiMentorConfigured?: boolean;
};

/** intro → taking (+ submit_confirm modal) → result */
type Phase = "intro" | "taking" | "result";

export function ModuleTestRunner({
  moduleId,
  moduleTitle,
  moduleOrderNumber,
  moduleDescription = null,
  attemptCount = 0,
  maxAttempts = null,
  testId,
  title,
  minScore,
  questions,
  lastAttempt,
  modulePathSteps = [],
  timeLimitMinutes = null,
  allowFreeNavigation = true,
  learning,
  aiMentorConfigured = true,
}: ModuleTestRunnerProps) {
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [local, setLocal] = useState<TestLocalAnswers>(() => emptyTestLocalAnswers(questions));
  const [submitOpen, setSubmitOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [sessionStartedAtMs, setSessionStartedAtMs] = useState<number | null>(null);
  const [result, setResult] = useState<{
    score: number;
    maxScore: number;
    passed: boolean;
    percent: number;
    correctCount: number;
    review: TestReviewRow[];
    canRetry: boolean;
    attemptsUsed: number;
    maxAttempts: number | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mentorOpenSeq, setMentorOpenSeq] = useState(0);
  const [mentorBootModeId, setMentorBootModeId] = useState<MentorModeId | null>(null);
  const [mentorBootPrompt, setMentorBootPrompt] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const questionCount = questions.length;
  const estimatedMinutes = estimateTestMinutes(questionCount);
  const maxScore = useMemo(() => computeTestMaxScore(questions), [questions]);
  const filledAll = useMemo(() => questions.every((qq) => isTestQuestionFilled(qq, local)), [questions, local]);
  const answeredCount = useMemo(() => countTestAnswered(questions, local), [questions, local]);
  const answeredFlags = useMemo(() => buildTestAnsweredFlags(questions, local), [questions, local]);
  const openedFlags = useTestOpenedFlags(questionCount, idx);
  const totalGraded = useMemo(
    () => questions.filter((q) => !(q.questionType === "TEXT" && q.manualTextGrading)).length,
    [questions],
  );

  const draftEnabled = phase === "taking";
  const isDraftDirty = draftEnabled && answeredCount > 0;

  const restoreDraft = useCallback((saved: TestLocalAnswers) => {
    setLocal(saved);
  }, []);

  useTestBeforeUnload(phase === "taking" && answeredCount > 0);

  const { clearDraft } = useFormDraft({
    storageKey: testDraftStorageKey(moduleId, testId),
    value: local,
    onRestore: restoreDraft,
    isDirty: isDraftDirty,
    enabled: draftEnabled,
  });

  const introState = resolveTestIntroState({
    attemptCount,
    maxAttempts,
    lastPassed: Boolean(lastAttempt?.passed),
  });

  const canStartNewAttempt = resolveTestCanRetry({ attemptsUsed: attemptCount, maxAttempts });

  function startTest() {
    if (!canStartNewAttempt) return;
    trackAnalyticsEvent(AnalyticsEvents.testStarted, {
      moduleId,
      testId,
      source: "test_intro",
    });
    setPhase("taking");
    setIdx(0);
    setSessionStartedAtMs(Date.now());
    setError(null);
    setResult(null);
  }

  function retryTest() {
    const allowed =
      result?.canRetry ??
      resolveTestCanRetry({ attemptsUsed: attemptCount, maxAttempts });
    if (!allowed) return;
    resetToIntro();
  }

  function resetToIntro() {
    clearDraft();
    setPhase("intro");
    setIdx(0);
    setLocal(emptyTestLocalAnswers(questions));
    setResult(null);
    setError(null);
    setSubmitOpen(false);
    setSessionStartedAtMs(null);
  }

  function toggleMulti(qid: string, aid: string) {
    setLocal((prev) => {
      const cur = prev.multi[qid] ?? [];
      const next = cur.includes(aid) ? cur.filter((x) => x !== aid) : [...cur, aid];
      return { ...prev, multi: { ...prev.multi, [qid]: next } };
    });
  }

  /** Server Action: только questionId + optionId/text; score на сервере. */
  function submit() {
    if (pending) return;
    setError(null);
    if (!filledAll) {
      setError(sanitizeTestUserMessage("Ответьте на все вопросы, чтобы отправить тест.", "submit"));
      return;
    }
    const payload = buildTestSubmitPayload(questions, local);
    startTransition(async () => {
      const res = await submitTestAttemptClient({ moduleId, testId, answers: payload });
      if (!res.ok) {
        const { kind, message } = resolveTestClientErrorDisplay(
          formatUserFacingError(res.error),
        );
        setError(sanitizeTestUserMessage(message, kind));
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
        canRetry: res.canRetry,
        attemptsUsed: res.attemptsUsed,
        maxAttempts: res.maxAttempts,
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
      <TestPageEmptyState kind="no_questions" moduleId={moduleId} moduleTitle={moduleTitle} compact />
    );
  }

  if (phase === "intro") {
    return (
      <section className="space-y-4" aria-label={`Тест: ${title}`}>
        <TestIntroScreen
          moduleId={moduleId}
          testTitle={title}
          moduleTitle={moduleTitle}
          moduleOrderNumber={moduleOrderNumber}
          moduleDescription={moduleDescription}
          questionCount={questionCount}
          estimatedMinutes={estimatedMinutes}
          minScore={minScore}
          maxScore={maxScore}
          attemptCount={attemptCount}
          maxAttempts={maxAttempts}
          timeLimitMinutes={timeLimitMinutes}
          lastAttempt={lastAttempt}
          questions={questions}
          modulePathSteps={modulePathSteps}
          state={introState}
          onStart={startTest}
          disabled={!canStartNewAttempt}
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
      </section>
    );
  }

  function openTestMentorChat(bootModeId?: MentorModeId, bootPrompt?: string) {
    if (!aiMentorConfigured) return;
    setMentorBootModeId(bootModeId ?? null);
    setMentorBootPrompt(bootPrompt?.trim() || null);
    setMentorOpenSeq((n) => n + 1);
    window.dispatchEvent(new CustomEvent("cyberedu:open-mentor"));
  }

  if (phase === "result" && result) {
    const testSummary = formatMentorTestSummary({
      title,
      percent: result.percent,
      passed: result.passed,
      correctCount: result.correctCount,
      totalGraded,
    });
    const testDebriefTopics = buildMentorTestDebriefHint(result.review);
    const resultModel = buildTestResultViewModel({
      attemptId: "current",
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percent,
      passed: result.passed,
      correctCount: result.correctCount,
      totalCount: totalGraded,
      moduleId,
      review: result.review,
      canRetry: result.canRetry,
      attemptsUsed: result.attemptsUsed,
      attemptLimit: result.maxAttempts ?? maxAttempts,
    });
    const mentorSafeContext = buildTestMentorSafeContext({
      moduleId,
      testTitle: title,
      moduleTitle,
      percent: result.percent,
      passed: result.passed,
    });
    const mentorContext = buildTestResultAIMentorContextInput({
      moduleId,
      attemptId: resultModel.attemptId,
      testTitle: title,
      moduleTitle,
      safeTopic: moduleTitle,
      weakTopics: resultModel.weakTopics,
      strongTopics: resultModel.strongTopics,
      recommendations: resultModel.recommendations,
    });
    const mentorChatLabels = testMentorContextLabels(mentorSafeContext);

    return (
      <LearnEnter>
        <section aria-label="Результат теста">
        <TestResultScreen
          moduleId={moduleId}
          moduleTitle={moduleTitle}
          title={title}
          score={result.score}
          maxScore={result.maxScore}
          percent={result.percent}
          passed={result.passed}
          minScore={minScore}
          correctCount={result.correctCount}
          totalGraded={totalGraded}
          review={result.review}
          learning={learning}
          attemptsUsed={result.attemptsUsed}
          maxAttempts={result.maxAttempts ?? maxAttempts}
          canRetry={result.canRetry}
          onRetry={retryTest}
          aiMentorConfigured={aiMentorConfigured}
          onOpenMentorChat={openTestMentorChat}
        />
        </section>
        <AiMentorChat
          moduleId={moduleId}
          aiConfigured={aiMentorConfigured}
          openSignal={mentorOpenSeq}
          bootModeId={mentorBootModeId}
          bootPrompt={mentorBootPrompt}
          testDebriefTopics={testDebriefTopics}
          mentorContext={mentorContext}
          contextLabels={{
            ...mentorChatLabels,
            testSummary,
          }}
        />
      </LearnEnter>
    );
  }

  return (
    <LearnEnter>
      <div className="relative min-w-0 max-w-full overflow-x-clip">
        <TestTakingScreen
          title={title}
          moduleTitle={moduleTitle}
          minScore={minScore}
          maxScore={maxScore}
          questions={questions}
          currentIndex={idx}
          answers={local}
          error={error}
          pending={pending}
          answeredCount={answeredCount}
          answeredFlags={answeredFlags}
          submitDialogOpen={submitOpen}
          onSubmitDialogOpenChange={setSubmitOpen}
          onIndexChange={setIdx}
          onSingleSelect={(qid, aid) => setLocal((p) => ({ ...p, single: { ...p.single, [qid]: aid } }))}
          onMultiToggle={toggleMulti}
          onTextChange={(qid, text) => setLocal((p) => ({ ...p, text: { ...p.text, [qid]: text } }))}
          onRequestSubmit={() => {
            setError(null);
            setSubmitOpen(true);
          }}
          onConfirmSubmit={submit}
          draftSaved={isDraftDirty}
          timeLimitMinutes={timeLimitMinutes}
          sessionStartedAtMs={sessionStartedAtMs}
          openedFlags={openedFlags}
          allowFreeNavigation={allowFreeNavigation}
        />
        <TestExitDialog
          open={exitOpen}
          onOpenChange={setExitOpen}
          answeredCount={answeredCount}
          total={questionCount}
          onConfirmExit={() => {
            setExitOpen(false);
            resetToIntro();
          }}
        />
        {pending ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-background/75 backdrop-blur-sm">
            <LoadingState
              size="sm"
              label="Проверка ответов…"
              terminalLine="assessment --grade"
              className="border-0 bg-transparent shadow-none ring-0"
            />
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
