import type { PracticalTaskType } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  checkModuleAccessForApi,
  checkPracticeEntry,
  checkPracticeTaskSubmitBlocked,
} from "@/lib/course-progress-guards";

export type PracticeSubmitGuardOk = { ok: true; userId: string };
export type PracticeSubmitGuardFail = { ok: false; status: number; message: string };
export type PracticeSubmitGuardResult = PracticeSubmitGuardOk | PracticeSubmitGuardFail;

export async function guardPracticeSubmission(
  sessionUserId: string | undefined,
  moduleId: string,
  taskId: string,
  allowedTypes: PracticalTaskType[],
): Promise<PracticeSubmitGuardResult> {
  if (!sessionUserId) {
    return { ok: false, status: 401, message: "Требуется вход." };
  }

  const modGate = await checkModuleAccessForApi(sessionUserId, moduleId);
  if (!modGate.ok) {
    return { ok: false, status: 403, message: modGate.message };
  }

  const practiceGate = await checkPracticeEntry(sessionUserId, moduleId);
  if (!practiceGate.ok) {
    return { ok: false, status: 403, message: practiceGate.message };
  }

  const task = await prisma.practicalTask.findFirst({
    where: { id: taskId, moduleId },
    select: { id: true, taskType: true },
  });
  if (!task) {
    return { ok: false, status: 404, message: "Задание не найдено." };
  }
  if (!allowedTypes.includes(task.taskType)) {
    return { ok: false, status: 400, message: "Некорректный тип задания для этой операции." };
  }

  const submitBlocked = await checkPracticeTaskSubmitBlocked(sessionUserId, taskId);
  if (submitBlocked) {
    return { ok: false, status: 403, message: submitBlocked };
  }

  return { ok: true, userId: sessionUserId };
}
