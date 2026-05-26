"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { QuestionType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/lib/security/admin-action-guard";

export type AdminTestFormState = { error?: string };

const QUESTION_TEMP_ORDER = 2_000_000;

function parseQuestionType(raw: string): QuestionType | null {
  const v = raw.trim() as QuestionType;
  if (v === "SINGLE_CHOICE" || v === "MULTIPLE_CHOICE" || v === "TRUE_FALSE" || v === "TEXT") return v;
  return null;
}

async function revalidateAdminTest(testId: string) {
  const t = await prisma.test.findUnique({
    where: { id: testId },
    select: { moduleId: true },
  });
  revalidatePath("/admin/tests");
  revalidatePath(`/admin/tests/${testId}/edit`);
  if (t) {
    revalidatePath(`/dashboard/course/${t.moduleId}/test`);
    revalidatePath(`/dashboard/course/${t.moduleId}`);
    revalidatePath("/dashboard/course");
  }
}

async function applyQuestionOrder(testId: string, orderedIds: string[]) {
  const existing = await prisma.question.findMany({
    where: { testId },
    select: { id: true },
  });
  if (existing.length !== orderedIds.length) throw new Error("INVALID_ORDER");
  const set = new Set(existing.map((e) => e.id));
  for (const id of orderedIds) {
    if (!set.has(id)) throw new Error("INVALID_ORDER");
  }

  await prisma.$transaction(async (tx) => {
    let i = 0;
    for (const id of orderedIds) {
      await tx.question.update({
        where: { id },
        data: { orderNumber: QUESTION_TEMP_ORDER + i++ },
      });
    }
    let n = 1;
    for (const id of orderedIds) {
      await tx.question.update({
        where: { id },
        data: { orderNumber: n++ },
      });
    }
  });
}

async function reorderQuestionToPositionInternal(testId: string, questionId: string, position: number) {
  const qs = await prisma.question.findMany({
    where: { testId },
    orderBy: { orderNumber: "asc" },
    select: { id: true },
  });
  const ids = qs.map((x) => x.id);
  const from = ids.indexOf(questionId);
  if (from === -1) return { error: "Вопрос не найден." } as const;
  const to = Math.min(Math.max(1, position), ids.length) - 1;
  const next = [...ids];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  await applyQuestionOrder(testId, next);
  return { ok: true } as const;
}

async function validateChoiceAnswers(questionId: string, questionType: QuestionType): Promise<string | null> {
  const answers = await prisma.answer.findMany({ where: { questionId } });
  if (questionType === "TEXT") return null;
  if (answers.length < 2) return "Нужно минимум два варианта ответа.";
  const correct = answers.filter((a) => a.isCorrect);
  if (correct.length < 1) return "Отметьте хотя бы один правильный вариант.";
  if (questionType === "SINGLE_CHOICE" || questionType === "TRUE_FALSE") {
    if (correct.length !== 1) return "Должен быть ровно один правильный вариант.";
  }
  if (questionType === "TRUE_FALSE" && answers.length !== 2) {
    return "Тип «Верно/неверно» требует ровно два варианта.";
  }
  return null;
}

export async function createTestAction(
  _prev: AdminTestFormState | null,
  formData: FormData,
): Promise<AdminTestFormState> {
  await requireAdminAction();
  const moduleId = String(formData.get("moduleId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const minScore = parseInt(String(formData.get("minScore") ?? "0"), 10);
  if (!moduleId || !title) return { error: "Укажите модуль и название теста." };
  if (Number.isNaN(minScore) || minScore < 0) return { error: "Проходной балл — неотрицательное число." };

  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) return { error: "Модуль не найден." };

  const test = await prisma.test.create({
    data: { moduleId, title, minScore },
  });
  await revalidateAdminTest(test.id);
  redirect(`/admin/tests/${test.id}/edit`);
}

export async function updateTestMetaAction(
  _prev: AdminTestFormState | null,
  formData: FormData,
): Promise<AdminTestFormState> {
  await requireAdminAction();
  const testId = String(formData.get("testId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const minScore = parseInt(String(formData.get("minScore") ?? "0"), 10);
  if (!testId || !title) return { error: "Некорректные данные." };
  if (Number.isNaN(minScore) || minScore < 0) return { error: "Проходной балл — неотрицательное число." };

  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) return { error: "Тест не найден." };

  await prisma.test.update({
    where: { id: testId },
    data: { title, minScore },
  });
  await revalidateAdminTest(testId);
  redirect(`/admin/tests/${testId}/edit`);
}

export async function createQuestionAction(testId: string) {
  await requireAdminAction();
  const test = await prisma.test.findUnique({ where: { id: testId } });
  if (!test) redirect("/admin/tests");

  const maxOrder = await prisma.question.aggregate({
    where: { testId },
    _max: { orderNumber: true },
  });
  const orderNumber = (maxOrder._max.orderNumber ?? 0) + 1;

  await prisma.question.create({
    data: {
      testId,
      orderNumber,
      points: 10,
      questionText: "Новый вопрос",
      questionType: QuestionType.SINGLE_CHOICE,
      answers: {
        create: [
          { answerText: "Вариант А", isCorrect: true },
          { answerText: "Вариант Б", isCorrect: false },
        ],
      },
    },
  });
  await revalidateAdminTest(testId);
  redirect(`/admin/tests/${testId}/edit`);
}

export async function moveQuestionAction(
  testId: string,
  questionId: string,
  direction: "up" | "down",
): Promise<{ ok?: boolean; error?: string }> {
  await requireAdminAction();
  const q = await prisma.question.findFirst({ where: { id: questionId, testId } });
  if (!q) return { error: "Вопрос не найден." };

  const neighbor = await prisma.question.findFirst({
    where: {
      testId,
      orderNumber: direction === "up" ? q.orderNumber - 1 : q.orderNumber + 1,
    },
  });
  if (!neighbor) {
    await revalidateAdminTest(testId);
    return { ok: true };
  }

  await prisma.$transaction(async (tx) => {
    await tx.question.update({ where: { id: q.id }, data: { orderNumber: QUESTION_TEMP_ORDER } });
    await tx.question.update({ where: { id: neighbor.id }, data: { orderNumber: q.orderNumber } });
    await tx.question.update({ where: { id: q.id }, data: { orderNumber: neighbor.orderNumber } });
  });
  await revalidateAdminTest(testId);
  return { ok: true };
}

export async function deleteQuestionAction(questionId: string, testId: string) {
  await requireAdminAction();
  const q = await prisma.question.findFirst({ where: { id: questionId, testId } });
  if (!q) return;

  await prisma.question.delete({ where: { id: questionId } });
  await revalidateAdminTest(testId);
}

export async function deleteAnswerAction(answerId: string, testId: string, questionId: string) {
  await requireAdminAction();
  const answer = await prisma.answer.findFirst({
    where: { id: answerId, questionId },
    include: { question: true },
  });
  if (!answer || answer.question.testId !== testId) {
    redirect(`/admin/tests/${testId}/edit`);
  }
  if (answer.question.questionType === "TEXT") {
    redirect(`/admin/tests/${testId}/edit`);
  }

  const count = await prisma.answer.count({ where: { questionId } });
  if (count <= 2) {
    redirect(`/admin/tests/${testId}/edit?err=min_answers`);
  }

  await prisma.answer.delete({ where: { id: answerId } });
  await revalidateAdminTest(testId);
  redirect(`/admin/tests/${testId}/edit`);
}

export async function updateQuestionAction(
  _prev: AdminTestFormState | null,
  formData: FormData,
): Promise<AdminTestFormState> {
  await requireAdminAction();
  const questionId = String(formData.get("questionId") ?? "").trim();
  const testId = String(formData.get("testId") ?? "").trim();
  const questionText = String(formData.get("questionText") ?? "").trim();
  const questionType = parseQuestionType(String(formData.get("questionType") ?? ""));
  const points = parseInt(String(formData.get("points") ?? "1"), 10);
  const positionRaw = formData.get("orderPosition");
  const textManualGrading = formData.get("textManualGrading") === "on";
  const textExpectedRaw = String(formData.get("textExpectedAnswer") ?? "").trim();

  if (!questionId || !testId) return { error: "Некорректные идентификаторы." };
  if (!questionText) return { error: "Введите текст вопроса." };
  if (!questionType) return { error: "Некорректный тип вопроса." };
  if (Number.isNaN(points) || points < 1) return { error: "Баллы — целое число не меньше 1." };

  const q = await prisma.question.findFirst({
    where: { id: questionId, testId },
  });
  if (!q) return { error: "Вопрос не найден." };

  if (questionType === "TEXT") {
    if (!textManualGrading && !textExpectedRaw) {
      return {
        error: "Для текстового вопроса укажите пример правильного ответа или включите «Только ручная проверка».",
      };
    }
  }

  await prisma.$transaction(async (tx) => {
    if (questionType === "TEXT") {
      await tx.answer.deleteMany({ where: { questionId } });
    }
    await tx.question.update({
      where: { id: questionId },
      data: {
        questionText,
        questionType,
        points,
        textExpectedAnswer:
          questionType === "TEXT" && !textManualGrading ? textExpectedRaw : null,
        textManualGrading: questionType === "TEXT" ? textManualGrading : false,
      },
    });
    if (questionType !== "TEXT") {
      const cnt = await tx.answer.count({ where: { questionId } });
      if (cnt === 0) {
        if (questionType === QuestionType.TRUE_FALSE) {
          await tx.answer.createMany({
            data: [
              { questionId, answerText: "Верно", isCorrect: false },
              { questionId, answerText: "Неверно", isCorrect: true },
            ],
          });
        } else {
          await tx.answer.createMany({
            data: [
              { questionId, answerText: "Вариант 1", isCorrect: true },
              { questionId, answerText: "Вариант 2", isCorrect: false },
            ],
          });
        }
      }
    }
  });

  if (positionRaw !== null && String(positionRaw).trim() !== "") {
    const pos = parseInt(String(positionRaw), 10);
    if (!Number.isNaN(pos) && pos >= 1) {
      const r = await reorderQuestionToPositionInternal(testId, questionId, pos);
      if ("error" in r) return { error: r.error };
    }
  }

  const choiceErr = await validateChoiceAnswers(questionId, questionType);
  if (choiceErr) return { error: choiceErr };

  await revalidateAdminTest(testId);
  redirect(`/admin/tests/${testId}/edit`);
}

export async function addAnswerAction(testId: string, questionId: string) {
  await requireAdminAction();
  const q = await prisma.question.findFirst({
    where: { id: questionId, testId },
    select: { questionType: true },
  });
  if (!q || q.questionType === "TEXT") redirect(`/admin/tests/${testId}/edit`);

  await prisma.answer.create({
    data: {
      questionId,
      answerText: "Новый вариант",
      isCorrect: false,
    },
  });
  await revalidateAdminTest(testId);
  redirect(`/admin/tests/${testId}/edit`);
}

export async function updateAnswerAction(formData: FormData): Promise<void> {
  await requireAdminAction();
  const answerId = String(formData.get("answerId") ?? "").trim();
  const testId = String(formData.get("testId") ?? "").trim();
  const questionId = String(formData.get("questionId") ?? "").trim();
  const answerText = String(formData.get("answerText") ?? "").trim();
  const isCorrect = formData.get("isCorrect") === "on";

  if (!answerId || !testId || !questionId) {
    redirect(`/admin/tests`);
  }
  if (!answerText) {
    redirect(`/admin/tests/${testId}/edit?err=empty_answer`);
  }

  const answer = await prisma.answer.findFirst({
    where: { id: answerId, questionId },
    include: { question: true },
  });
  if (!answer || answer.question.testId !== testId) {
    redirect(`/admin/tests`);
  }
  if (answer.question.questionType === "TEXT") {
    redirect(`/admin/tests/${testId}/edit`);
  }

  await prisma.answer.update({
    where: { id: answerId },
    data: { answerText, isCorrect },
  });

  const err = await validateChoiceAnswers(questionId, answer.question.questionType);
  if (err) {
    redirect(`/admin/tests/${testId}/edit?err=answer_rules`);
  }

  await revalidateAdminTest(testId);
  redirect(`/admin/tests/${testId}/edit`);
}
