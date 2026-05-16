import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  allTestsPassed,
  getModuleRequirements,
  isModuleUnlocked,
  loadModuleForProgress,
  recalculateModuleProgress,
} from "@/lib/progress";

/** Сообщения для UI и ошибок server actions */
export const COURSE_PROGRESS_USER_MESSAGES = {
  PREVIOUS_MODULE: "Сначала завершите предыдущий модуль",
  LESSON_FIRST: "Сначала изучите лекцию",
  VIDEO_FIRST: "Сначала просмотрите видео к лекции",
  TEST_FIRST: "Сначала пройдите тест",
  PENDING_REVIEW: "Работа ожидает проверки",
  NEEDS_REVISION: "Работа отправлена на доработку",
  MODULE_DONE: "Модуль завершен",
  NEXT_OPEN: "Следующий модуль открыт",
  MODULE_INACTIVE: "Модуль недоступен",
} as const;

export class ProgressAccessError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ProgressAccessError";
    this.code = code;
  }
}

export function isProgressAccessError(e: unknown): e is ProgressAccessError {
  return e instanceof ProgressAccessError;
}

/**
 * Модуль существует, активен и открыт по цепочке.
 * При нарушении — редирект на хаб модуля (там объяснение) или на каталог курса.
 */
export async function assertModuleAccess(userId: string, moduleId: string): Promise<void> {
  const m = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true, isActive: true },
  });
  if (!m?.isActive) redirect("/dashboard/course");
  /** Закрытый по цепочке модуль: не открываем хаб — только каталог курса (логика совпадает с API). */
  if (!(await isModuleUnlocked(userId, moduleId))) {
    redirect("/dashboard/course?locked=1");
  }
}

export type ProgressGate = { ok: true } | { ok: false; code: string; message: string };

/** Для API и сервисов: без redirect, только результат. */
export async function checkModuleAccessForApi(userId: string, moduleId: string): Promise<ProgressGate> {
  const m = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true, isActive: true },
  });
  if (!m?.isActive) {
    return { ok: false, code: "MODULE_INACTIVE", message: COURSE_PROGRESS_USER_MESSAGES.MODULE_INACTIVE };
  }
  if (!(await isModuleUnlocked(userId, moduleId))) {
    return { ok: false, code: "MODULE_LOCKED", message: COURSE_PROGRESS_USER_MESSAGES.PREVIOUS_MODULE };
  }
  return { ok: true };
}

/** Проверки перед тестом: цепочка модулей, лекция, видео (если есть). */
export async function checkTestPrerequisites(userId: string, moduleId: string): Promise<ProgressGate> {
  const mod = await loadModuleForProgress(moduleId);
  if (!mod || !mod.isActive) {
    return { ok: false, code: "MODULE_INACTIVE", message: COURSE_PROGRESS_USER_MESSAGES.MODULE_INACTIVE };
  }
  if (!(await isModuleUnlocked(userId, moduleId))) {
    return { ok: false, code: "MODULE_LOCKED", message: COURSE_PROGRESS_USER_MESSAGES.PREVIOUS_MODULE };
  }
  const req = getModuleRequirements(mod);
  const p = await prisma.progress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
    select: { lessonCompleted: true, videoCompleted: true },
  });
  if (req.lessonRequired && !p?.lessonCompleted) {
    return { ok: false, code: "LESSON", message: COURSE_PROGRESS_USER_MESSAGES.LESSON_FIRST };
  }
  if (req.videoRequired && !p?.videoCompleted) {
    return { ok: false, code: "VIDEO", message: COURSE_PROGRESS_USER_MESSAGES.VIDEO_FIRST };
  }
  return { ok: true };
}

/** Для отправки теста и других server actions: при ошибке — исключение. */
export async function assertTestAccess(userId: string, moduleId: string): Promise<void> {
  const r = await checkTestPrerequisites(userId, moduleId);
  if (!r.ok) throw new ProgressAccessError(r.code, r.message);
}

/** Доступ к странице / отправке практики: пройдены тесты (если они есть в модуле). */
export async function checkPracticeEntry(userId: string, moduleId: string): Promise<ProgressGate> {
  const pre = await checkTestPrerequisites(userId, moduleId);
  if (!pre.ok) return pre;
  const mod = await loadModuleForProgress(moduleId);
  if (!mod) {
    return { ok: false, code: "MODULE_INACTIVE", message: COURSE_PROGRESS_USER_MESSAGES.MODULE_INACTIVE };
  }
  const req = getModuleRequirements(mod);
  if (req.testRequired) {
    const ids = mod.tests.map((t) => t.id);
    if (!(await allTestsPassed(userId, ids))) {
      return { ok: false, code: "TEST", message: COURSE_PROGRESS_USER_MESSAGES.TEST_FIRST };
    }
  }
  return { ok: true };
}

export async function assertPracticeAccess(userId: string, moduleId: string): Promise<void> {
  const r = await checkPracticeEntry(userId, moduleId);
  if (!r.ok) throw new ProgressAccessError(r.code, r.message);
}

/**
 * Блокирует новую отправку, пока последняя не-черновая работа по заданию на ручной проверке в статусе SUBMITTED.
 * NEEDS_REVISION и REJECTED — можно отправить снова.
 */
export async function checkPracticeTaskSubmitBlocked(userId: string, taskId: string): Promise<string | null> {
  const latest = await prisma.submission.findFirst({
    where: { userId, practicalTaskId: taskId, status: { not: "DRAFT" } },
    orderBy: { createdAt: "desc" },
    select: { status: true },
  });
  if (latest?.status === "SUBMITTED" || latest?.status === "CHECKING") {
    return COURSE_PROGRESS_USER_MESSAGES.PENDING_REVIEW;
  }
  return null;
}

export async function updateModuleCompletion(userId: string, moduleId: string) {
  const before = await prisma.progress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
    select: { moduleCompleted: true },
  });
  const result = await recalculateModuleProgress(userId, moduleId);
  const messages: string[] = [];
  if (result?.moduleCompleted && !before?.moduleCompleted) {
    messages.push(COURSE_PROGRESS_USER_MESSAGES.MODULE_DONE);
    messages.push(COURSE_PROGRESS_USER_MESSAGES.NEXT_OPEN);
  }
  return { result, messages };
}

/** Пересчёт прогресса по всем активным модулям курса (по порядку). */
export async function updateCourseCompletion(userId: string, courseId: string): Promise<void> {
  const modules = await prisma.module.findMany({
    where: { courseId, isActive: true },
    orderBy: { orderNumber: "asc" },
    select: { id: true },
  });
  for (const { id } of modules) {
    await recalculateModuleProgress(userId, id);
  }
}

/** Удобно для API: последний статус практики по заданию (для подписи «на доработку»). */
export async function getLatestPracticeSubmissionStatus(
  userId: string,
  taskId: string,
): Promise<"NONE" | "SUBMITTED" | "NEEDS_REVISION" | "ACCEPTED" | "REJECTED" | "OTHER"> {
  const latest = await prisma.submission.findFirst({
    where: { userId, practicalTaskId: taskId, status: { not: "DRAFT" } },
    orderBy: { createdAt: "desc" },
    select: { status: true },
  });
  if (!latest) return "NONE";
  switch (latest.status) {
    case "SUBMITTED":
      return "SUBMITTED";
    case "NEEDS_REVISION":
      return "NEEDS_REVISION";
    case "ACCEPTED":
      return "ACCEPTED";
    case "REJECTED":
      return "REJECTED";
    default:
      return "OTHER";
  }
}
