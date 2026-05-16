"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, type CheckType, type PracticalTaskType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";

export type AdminPracticalFormState = { error?: string };

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

function parseTaskType(raw: string): PracticalTaskType | null {
  const v = raw.trim();
  const allowed = new Set<PracticalTaskType>([
    "INTERACTIVE",
    "FILE_UPLOAD",
    "TEXT_ANSWER",
    "COMBINED",
    "SITUATION_CHOICE",
    "PASSWORD_ANALYSIS",
    "PHISHING_ANALYSIS",
    "CHECKLIST",
    "URL_ANALYSIS",
    "TRAINING_CONSOLE",
    "CRYPTO_TASK",
    "LOG_ANALYSIS",
  ]);
  return allowed.has(v as PracticalTaskType) ? (v as PracticalTaskType) : null;
}

function parseCheckType(raw: string): CheckType | null {
  const v = raw.trim();
  if (v === "AUTO" || v === "MANUAL" || v === "MIXED") return v;
  return null;
}

function buildPayload(formData: FormData) {
  const taskType = parseTaskType(String(formData.get("taskType") ?? ""));
  const checkType = parseCheckType(String(formData.get("checkType") ?? ""));
  if (!taskType || !checkType) return null;

  const minLengthRaw = parseInt(String(formData.get("minLength") ?? "10"), 10);
  const minLength =
    taskType === "FILE_UPLOAD"
      ? 10
      : Math.min(50000, Math.max(1, Number.isNaN(minLengthRaw) ? 10 : minLengthRaw));

  const maxFileMbRaw = String(formData.get("maxFileSizeMb") ?? "").trim();
  let maxFileSizeMb: number | null = null;
  if (maxFileMbRaw !== "") {
    const n = parseInt(maxFileMbRaw, 10);
    if (!Number.isNaN(n)) maxFileSizeMb = Math.min(100, Math.max(1, n));
  }

  const allowedFileTypes =
    taskType === "FILE_UPLOAD" || taskType === "COMBINED" ? emptyToNull(formData.get("allowedFileTypes")) : null;

  let expectedCommand: string | null = null;
  let expectedAnswerPattern: string | null = null;
  let interactiveExpectedAnswer: string | null = null;
  let consoleScenario: string | null = null;

  if (taskType === "INTERACTIVE" || taskType === "TRAINING_CONSOLE") {
    expectedCommand = emptyToNull(formData.get("expectedCommand"));
    expectedAnswerPattern = emptyToNull(formData.get("expectedAnswerPattern"));
    interactiveExpectedAnswer = emptyToNull(formData.get("interactiveExpectedAnswer"));
    consoleScenario = emptyToNull(formData.get("consoleScenario"));
  }

  const instruction =
    taskType === "TEXT_ANSWER" || taskType === "COMBINED" ? emptyToNull(formData.get("instruction")) : null;

  const maxScoreRaw = parseInt(String(formData.get("maxScore") ?? "0"), 10);
  const maxScore = Number.isNaN(maxScoreRaw) ? 0 : Math.max(0, maxScoreRaw);

  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    taskType,
    checkType,
    maxScore,
    minLength,
    expectedCommand,
    expectedAnswerPattern,
    interactiveExpectedAnswer,
    consoleScenario,
    allowedFileTypes,
    maxFileSizeMb,
    instruction,
  };
}

async function revalidatePracticeForModule(moduleId: string) {
  revalidatePath("/admin/practical-tasks");
  revalidatePath(`/dashboard/course/${moduleId}/practice`);
  revalidatePath(`/dashboard/course/${moduleId}`);
  revalidatePath("/dashboard/course");
}

export async function savePracticalTaskAction(
  _prev: AdminPracticalFormState | null,
  formData: FormData,
): Promise<AdminPracticalFormState> {
  await requireAdmin();

  const payload = buildPayload(formData);
  if (!payload) return { error: "Некорректный тип задания или проверки." };

  const scenarioStr = String(formData.get("scenarioData") ?? "").trim();
  let scenarioData: Prisma.InputJsonValue | null = null;
  if (scenarioStr !== "") {
    try {
      scenarioData = JSON.parse(scenarioStr) as Prisma.InputJsonValue;
    } catch {
      return { error: "Поле «Сценарий (JSON)» содержит невалидный JSON." };
    }
  }

  if (!payload.title) return { error: "Укажите название." };
  if (!payload.description) return { error: "Укажите описание." };

  const moduleId = String(formData.get("moduleId") ?? "").trim();
  if (!moduleId) return { error: "Выберите модуль." };

  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) return { error: "Модуль не найден." };

  const taskId = String(formData.get("taskId") ?? "").trim();

  const data = {
    moduleId,
    title: payload.title,
    description: payload.description,
    taskType: payload.taskType,
    checkType: payload.checkType,
    maxScore: payload.maxScore,
    minLength: payload.minLength,
    expectedCommand: payload.expectedCommand,
    expectedAnswerPattern: payload.expectedAnswerPattern,
    interactiveExpectedAnswer: payload.interactiveExpectedAnswer,
    consoleScenario: payload.consoleScenario,
    allowedFileTypes: payload.allowedFileTypes,
    maxFileSizeMb: payload.maxFileSizeMb,
    instruction: payload.instruction,
    scenarioData: scenarioData === null ? Prisma.DbNull : scenarioData,
  };

  if (taskId) {
    const ex = await prisma.practicalTask.findUnique({ where: { id: taskId }, select: { moduleId: true } });
    if (!ex) return { error: "Задание не найдено." };
    await prisma.practicalTask.update({ where: { id: taskId }, data });
    await revalidatePracticeForModule(moduleId);
    if (ex.moduleId !== moduleId) await revalidatePracticeForModule(ex.moduleId);
    redirect(`/admin/practical-tasks/${taskId}/edit`);
  }

  const row = await prisma.practicalTask.create({ data });
  await revalidatePracticeForModule(moduleId);
  redirect(`/admin/practical-tasks/${row.id}/edit`);
}
