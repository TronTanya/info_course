"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  persistPracticeSubmission,
  resolveInteractiveAutoResult,
  resolveStructuredSubmission,
  resolveTextAnswerSubmission,
} from "@/lib/practice-progress-engine";
import { STRUCTURED_SCENARIO_TASK_TYPES, verifyStructuredPractice } from "@/lib/practice-scenario-verify";
import { guardPracticeSubmission } from "@/lib/practice-submit-guard";
import { enforceServerActionRateLimit } from "@/lib/security/server-action-rate-limit";
import { securityLog } from "@/lib/security-log";

function revalidatePractice(moduleId: string) {
  revalidatePath(`/dashboard/course/${moduleId}/practice`);
  revalidatePath(`/dashboard/course/${moduleId}`);
  revalidatePath("/dashboard/course");
}

function normalizeInteractive(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

export type PracticeActionState = {
  ok?: boolean;
  error?: string;
  fallbackManual?: boolean;
  /** Ответ принят, но ожидает ручной доработки (смешанная проверка) */
  pendingReview?: boolean;
};

function logPracticeSubmit(userId: string, practicalTaskId: string, channel: string) {
  securityLog("practice.submit", { userId, practicalTaskId, channel });
}

export async function submitPracticeTextAction(input: {
  moduleId: string;
  practicalTaskId: string;
  text: string;
}): Promise<PracticeActionState> {
  const session = await auth();
  const g = await guardPracticeSubmission(session?.user?.id, input.moduleId, input.practicalTaskId, ["TEXT_ANSWER"]);
  if (!g.ok) return { error: g.message };

  const textRl = await enforceServerActionRateLimit("practiceText", g.userId);
  if (!textRl.allowed) return { error: textRl.error };

  const task = await prisma.practicalTask.findUnique({
    where: { id: input.practicalTaskId },
    select: { minLength: true, checkType: true, maxScore: true, expectedAnswerPattern: true },
  });
  const minLen = Math.min(50_000, Math.max(1, task?.minLength ?? 10));

  const body = input.text.trim();
  if (body.length < minLen) {
    return { error: `Ответ слишком короткий (минимум ${minLen} символов).` };
  }
  if (body.length > 50_000) return { error: "Ответ слишком длинный." };

  const plan = resolveTextAnswerSubmission(
    task?.checkType ?? "MANUAL",
    body,
    task?.maxScore ?? 0,
    task?.expectedAnswerPattern,
  );
  if (plan.kind === "reject") {
    return { error: plan.error };
  }

  await persistPracticeSubmission({
    userId: g.userId,
    moduleId: input.moduleId,
    practicalTaskId: input.practicalTaskId,
    textAnswer: body,
    status: plan.status,
    score: plan.score,
  });
  revalidatePractice(input.moduleId);
  logPracticeSubmit(g.userId, input.practicalTaskId, "text");
  return { ok: true, pendingReview: plan.pendingReview };
}

function buildInteractiveTextAnswer(parts: string[]): string {
  return parts.filter(Boolean).join("\n\n").slice(0, 8000);
}

function testAnswerPattern(pattern: string, text: string): boolean {
  if (pattern.length > 400) return false;
  try {
    return new RegExp(pattern, "i").test(text.trim());
  } catch {
    return false;
  }
}

export async function verifyPracticeInteractiveAction(input: {
  moduleId: string;
  practicalTaskId: string;
  /** Legacy: кодовая фраза */
  answer?: string;
  /** Команда из учебной консоли (симулятор) */
  command?: string;
  /** Объяснение вывода / свободный текст для ручной проверки */
  explanation?: string;
}): Promise<PracticeActionState> {
  const session = await auth();
  const g = await guardPracticeSubmission(session?.user?.id, input.moduleId, input.practicalTaskId, [
    "INTERACTIVE",
    "TRAINING_CONSOLE",
  ]);
  if (!g.ok) return { error: g.message };

  const interactiveRl = await enforceServerActionRateLimit("practiceInteractive", g.userId, {
    exceeded: "Слишком много проверок задания. Подождите и попробуйте позже.",
  });
  if (!interactiveRl.allowed) return { error: interactiveRl.error };

  const task = await prisma.practicalTask.findUnique({
    where: { id: input.practicalTaskId },
    select: {
      interactiveExpectedAnswer: true,
      expectedCommand: true,
      expectedAnswerPattern: true,
      maxScore: true,
      minLength: true,
      checkType: true,
    },
  });

  const minLen = Math.min(50_000, Math.max(1, task?.minLength ?? 10));

  const existing = await prisma.submission.findFirst({
    where: { userId: g.userId, practicalTaskId: input.practicalTaskId, status: "ACCEPTED" },
    select: { id: true },
  });
  if (existing) {
    return { error: "Задание уже засчитано автоматически." };
  }

  const ec = task?.expectedCommand?.trim() ?? "";
  const ep = task?.expectedAnswerPattern?.trim() ?? "";
  const legacy = task?.interactiveExpectedAnswer?.trim() ?? "";
  const structured = Boolean(ec || ep);

  if (structured) {
    const exp = input.explanation?.trim() ?? "";
    const cmd = input.command?.trim() ?? "";

    if (ec) {
      if (!cmd) {
        return { error: "Выполните требуемую команду в учебной консоли и нажмите «Проверить задание»." };
      }
      if (normalizeInteractive(cmd) !== normalizeInteractive(ec)) {
        return { error: "Команда не совпадает с ожидаемой для задания." };
      }
    }

    if (ep) {
      const expMin = Math.max(12, minLen);
      if (exp.length < expMin) {
        return {
          error: `Напишите развёрнутое объяснение результата (минимум ${expMin} символов).`,
        };
      }
      if (!testAnswerPattern(ep, exp)) {
        return {
          error: "Объяснение не соответствует критерию. Опишите ключевые строки вывода (например TTL, время отклика, адрес).",
        };
      }
    }

    const parts: string[] = [];
    if (ec) parts.push(`[команда] ${cmd}`);
    if (ep) parts.push(`[объяснение] ${exp}`);

    const ir = resolveInteractiveAutoResult(task?.checkType ?? "AUTO", task?.maxScore ?? 0);
    await persistPracticeSubmission({
      userId: g.userId,
      moduleId: input.moduleId,
      practicalTaskId: input.practicalTaskId,
      textAnswer: buildInteractiveTextAnswer(parts),
      status: ir.status,
      score: ir.score,
    });
    revalidatePractice(input.moduleId);
    logPracticeSubmit(g.userId, input.practicalTaskId, "interactive_auto");
    return { ok: true, pendingReview: ir.status === "SUBMITTED" };
  }

  if (legacy) {
    const raw = input.answer?.trim() ?? "";
    if (!raw) return { error: "Введите ответ." };
    if (normalizeInteractive(raw) !== normalizeInteractive(legacy)) {
      return { error: "Неверно. Перечитайте условие и попробуйте снова." };
    }

    const ir = resolveInteractiveAutoResult(task?.checkType ?? "AUTO", task?.maxScore ?? 0);
    await persistPracticeSubmission({
      userId: g.userId,
      moduleId: input.moduleId,
      practicalTaskId: input.practicalTaskId,
      textAnswer: raw.slice(0, 8000),
      status: ir.status,
      score: ir.score,
    });
    revalidatePractice(input.moduleId);
    logPracticeSubmit(g.userId, input.practicalTaskId, "interactive_legacy");
    return { ok: true, pendingReview: ir.status === "SUBMITTED" };
  }

  const free = (input.explanation?.trim() || input.answer?.trim() || "").trim();
  if (free.length < minLen) {
    return { error: `Опишите выполненные шаги в учебной консоли (минимум ${minLen} символов).` };
  }

  await persistPracticeSubmission({
    userId: g.userId,
    moduleId: input.moduleId,
    practicalTaskId: input.practicalTaskId,
    textAnswer: free.slice(0, 8000),
    status: "SUBMITTED",
    score: null,
  });
  revalidatePractice(input.moduleId);
  logPracticeSubmit(g.userId, input.practicalTaskId, "interactive_manual");
  return { ok: true, fallbackManual: true };
}

export async function submitPracticeStructuredAction(input: {
  moduleId: string;
  practicalTaskId: string;
  payload: string;
}): Promise<PracticeActionState> {
  const session = await auth();
  const g = await guardPracticeSubmission(
    session?.user?.id,
    input.moduleId,
    input.practicalTaskId,
    STRUCTURED_SCENARIO_TASK_TYPES,
  );
  if (!g.ok) return { error: g.message };

  const structuredRl = await enforceServerActionRateLimit("practiceStructured", g.userId);
  if (!structuredRl.allowed) return { error: structuredRl.error };

  const task = await prisma.practicalTask.findUnique({
    where: { id: input.practicalTaskId },
    select: {
      taskType: true,
      scenarioData: true,
      maxScore: true,
      minLength: true,
      checkType: true,
    },
  });
  if (!task || !STRUCTURED_SCENARIO_TASK_TYPES.includes(task.taskType)) {
    return { error: "Задание не найдено или имеет другой тип." };
  }

  const existing = await prisma.submission.findFirst({
    where: { userId: g.userId, practicalTaskId: input.practicalTaskId, status: "ACCEPTED" },
    select: { id: true },
  });
  if (existing) {
    return { error: "Задание уже засчитано." };
  }

  const outcome = verifyStructuredPractice(
    task.taskType,
    task.scenarioData,
    input.payload,
    task.minLength,
  );
  if (outcome.decision === "reject") {
    return { error: outcome.error };
  }

  const plan = resolveStructuredSubmission(task.checkType, outcome, task.maxScore ?? 0);
  if (plan.kind === "reject") {
    return { error: plan.error };
  }

  await persistPracticeSubmission({
    userId: g.userId,
    moduleId: input.moduleId,
    practicalTaskId: input.practicalTaskId,
    textAnswer: outcome.textAnswer,
    status: plan.status,
    score: plan.score,
  });
  revalidatePractice(input.moduleId);
  logPracticeSubmit(
    g.userId,
    input.practicalTaskId,
    plan.pendingReview ? "structured_pending" : plan.status === "ACCEPTED" ? "structured_auto" : "structured_manual",
  );
  if (plan.pendingReview) {
    return { ok: true, pendingReview: true };
  }
  return { ok: true };
}
