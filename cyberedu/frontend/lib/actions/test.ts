"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkTestPrerequisites } from "@/lib/course-progress-guards";
import { recalculateModuleProgress } from "@/lib/progress";
import { consumeRateLimit } from "@/lib/rate-limit";
import {
  buildSubmittedMap,
  calculateTestScore,
  gradeQuestion,
  type SubmittedAnswerPayload,
} from "@/lib/test-grading";

export type SubmitTestState =
  | {
      ok: true;
      score: number;
      maxScore: number;
      passed: boolean;
      percent: number;
      /** Короткие пояснения с сервера (без поля is_correct). */
      review: { questionId: string; questionText: string; explanation: string | null }[];
    }
  | { ok: false; error: string };

function revalidateTestPaths(moduleId: string) {
  revalidatePath(`/dashboard/course/${moduleId}/test`);
  revalidatePath(`/dashboard/course/${moduleId}/practice`);
  revalidatePath(`/dashboard/course/${moduleId}`);
  revalidatePath("/dashboard/course");
}

export async function submitTestAttemptAction(input: {
  moduleId: string;
  testId: string;
  answers: SubmittedAnswerPayload[];
}): Promise<SubmitTestState> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Требуется вход." };

  const userId = session.user.id;
  if (!consumeRateLimit(`test:submit:user:${userId}`, 40, 60 * 60 * 1000)) {
    return { ok: false, error: "Слишком много отправок теста. Подождите и попробуйте позже." };
  }

  const { moduleId, testId, answers } = input;

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

  const byId = buildSubmittedMap(answers);
  if (byId.size !== questions.length) {
    return { ok: false, error: "Ответьте на все вопросы." };
  }

  for (const q of questions) {
    if (!byId.has(q.id)) return { ok: false, error: "Ответьте на все вопросы." };
  }

  for (const q of questions) {
    const s = byId.get(q.id)!;
    if (q.questionType === "MULTIPLE_CHOICE" || q.questionType === "MATCHING") {
      if (s.kind !== "multi") return { ok: false, error: "Некорректный формат ответов." };
    } else if (q.questionType === "TEXT") {
      if (s.kind !== "text") return { ok: false, error: "Некорректный формат ответов." };
    } else if (s.kind !== "single") {
      return { ok: false, error: "Некорректный формат ответов." };
    }
  }

  const { score, maxScore, passed, percent } = calculateTestScore({
    questions,
    answers,
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

  await prisma.$transaction(async (tx) => {
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

  await recalculateModuleProgress(userId, moduleId);
  revalidateTestPaths(moduleId);

  const review = questions.map((q) => ({
    questionId: q.id,
    questionText: q.questionText,
    explanation: q.explanation,
  }));

  return { ok: true, score, maxScore, passed, percent, review };
}
