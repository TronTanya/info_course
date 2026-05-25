"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkTestPrerequisites } from "@/lib/course-progress-guards";
import { recalculateModuleProgress } from "@/lib/progress";
import { enforceServerActionRateLimit } from "@/lib/security/server-action-rate-limit";
import { safeTestExplanation } from "@/lib/test-explanation-safety";
import {
  buildSubmittedMap,
  calculateTestScore,
  gradeQuestion,
  validateSubmissionForQuestion,
  type SubmittedAnswerPayload,
} from "@/lib/test-grading";
import {
  assertTestAttemptAllowed,
  resolveTestAttemptLimit,
  resolveTestCanRetry,
  TEST_ATTEMPTS_EXHAUSTED_MESSAGE,
} from "@/lib/test-retry";
import { sanitizeSubmittedAnswersForTransport } from "@/lib/test-submit-payload";

export type SubmitTestAttemptInput = {
  moduleId: string;
  testId: string;
  answers: SubmittedAnswerPayload[];
};

export type SubmitTestState =
  | {
      ok: true;
      score: number;
      maxScore: number;
      passed: boolean;
      percent: number;
      correctCount: number;
      /** Пояснения и итог по вопросам (без правильных вариантов). */
      review: {
        questionId: string;
        questionText: string;
        topic: string | null;
        feedback: string | null;
        explanation: string | null;
        isCorrect: boolean | null;
        showGradingStatus: boolean;
        pointsEarned: number;
        maxPoints: number;
      }[];
      /** После этой отправки: можно ли начать ещё одну попытку */
      canRetry: boolean;
      attemptsUsed: number;
      maxAttempts: number | null;
    }
  | { ok: false; error: string };

function revalidateTestPaths(moduleId: string) {
  revalidatePath(`/dashboard/course/${moduleId}/test`);
  revalidatePath(`/dashboard/course/${moduleId}/practice`);
  revalidatePath(`/dashboard/course/${moduleId}`);
  revalidatePath("/dashboard/course");
}

export async function submitTestAttemptAction(input: SubmitTestAttemptInput): Promise<SubmitTestState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Требуется вход." };

  const userId = session.user.id;
  const rateLimit = await enforceServerActionRateLimit("testSubmit", userId, {
    exceeded: "Слишком много отправок теста. Подождите и попробуйте позже.",
  });
  if (!rateLimit.allowed) {
    return { ok: false, error: rateLimit.error };
  }

  const { moduleId, testId } = input;
  const sanitizedAnswers = sanitizeSubmittedAnswersForTransport(input.answers);
  if (!sanitizedAnswers) {
    return { ok: false, error: "Некорректный формат ответов." };
  }

  const pre = await checkTestPrerequisites(userId, moduleId);
  if (!pre.ok) {
    return { ok: false, error: pre.message };
  }

  const test = await prisma.test.findFirst({
    where: { id: testId, moduleId },
    select: { id: true, minScore: true },
  });
  if (!test) return { ok: false, error: "Тест не найден." };

  const questions = await prisma.question.findMany({
    where: { testId },
    include: { answers: { orderBy: { id: "asc" } } },
    orderBy: { orderNumber: "asc" },
  });

  if (questions.length === 0) {
    return { ok: false, error: "В тесте нет вопросов." };
  }

  if (sanitizedAnswers.length !== questions.length) {
    return { ok: false, error: "Некорректный формат ответов." };
  }

  const byId = buildSubmittedMap(sanitizedAnswers);
  if (byId.size !== questions.length) {
    return { ok: false, error: "Ответьте на все вопросы." };
  }

  for (const q of questions) {
    if (!byId.has(q.id)) return { ok: false, error: "Ответьте на все вопросы." };
  }

  for (const q of questions) {
    const check = validateSubmissionForQuestion(q, byId.get(q.id));
    if (!check.ok) return { ok: false, error: check.error };
  }

  const maxAttempts = resolveTestAttemptLimit(null);

  const { score, maxScore, passed, percent } = calculateTestScore({
    questions,
    answers: sanitizedAnswers,
    minScore: test.minScore,
  });

  const rows: {
    questionId: string;
    answerId: string | null;
    textAnswer: string | null;
    isCorrect: boolean | null;
    pointsEarned: number;
  }[] = [];

  for (const q of questions) {
    const sub = byId.get(q.id);
    const g = gradeQuestion(q, sub);
    rows.push(...g.rows);
  }

  try {
    await prisma.$transaction(async (tx) => {
      const attemptCount = await tx.testAttempt.count({
        where: { userId, testId },
      });
      const attemptGuard = assertTestAttemptAllowed(attemptCount, maxAttempts);
      if (!attemptGuard.ok) {
        throw new Error(TEST_ATTEMPTS_EXHAUSTED_MESSAGE);
      }

      const attempt = await tx.testAttempt.create({
        data: {
          userId,
          testId,
          score,
          maxScore,
          passed,
        },
      });
      await tx.testAttemptAnswer.createMany({
        data: rows.map((r) => ({
          attemptId: attempt.id,
          questionId: r.questionId,
          answerId: r.answerId,
          textAnswer: r.textAnswer,
          isCorrect: r.isCorrect,
          pointsEarned: r.pointsEarned,
        })),
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === TEST_ATTEMPTS_EXHAUSTED_MESSAGE) {
      return { ok: false, error: e.message };
    }
    throw e;
  }

  await recalculateModuleProgress(userId, moduleId);
  revalidateTestPaths(moduleId);

  const review = questions.map((q) => {
    const sub = byId.get(q.id)!;
    const g = gradeQuestion(q, sub);
    const manual = q.questionType === "TEXT" && q.textManualGrading;
    const feedback = safeTestExplanation(q.explanation);
    const topic = q.topic?.trim() || null;
    return {
      questionId: q.id,
      questionText: q.questionText,
      topic,
      feedback,
      explanation: feedback,
      isCorrect: manual ? null : Boolean(g.rows[0]?.isCorrect),
      showGradingStatus: !manual,
      pointsEarned: g.pointsEarned,
      maxPoints: q.points,
    };
  });

  const correctCount = review.filter((r) => r.isCorrect === true).length;
  const attemptsUsed =
    (await prisma.testAttempt.count({ where: { userId, testId } })) || 1;
  const canRetry = resolveTestCanRetry({ attemptsUsed, maxAttempts });

  return {
    ok: true,
    score,
    maxScore,
    passed,
    percent,
    correctCount,
    review,
    canRetry,
    attemptsUsed,
    maxAttempts,
  };
}
