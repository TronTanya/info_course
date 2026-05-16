import { prisma } from "@/lib/db";
import { reconcileUserAchievements } from "@/lib/achievements";
import type { Module, Prisma, Progress } from "@prisma/client";

const progressSelect = {
  id: true,
  userId: true,
  moduleId: true,
  lessonCompleted: true,
  videoCompleted: true,
  testCompleted: true,
  practiceCompleted: true,
  moduleCompleted: true,
  score: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProgressSelect;

export type ProgressRow = Prisma.ProgressGetPayload<{ select: typeof progressSelect }>;

export type ModuleForProgress = {
  id: string;
  courseId: string;
  orderNumber: number;
  isActive: boolean;
  lessons: { videoUrl: string | null }[];
  tests: { id: string }[];
  practicalTasks: { id: string }[];
};

export type ModuleRequirements = {
  lessonRequired: boolean;
  videoRequired: boolean;
  testRequired: boolean;
  practiceRequired: boolean;
  totalSteps: number;
};

export function getModuleRequirements(m: ModuleForProgress): ModuleRequirements {
  const lessonRequired = m.lessons.length > 0;
  const videoRequired = m.lessons.some((l) => Boolean(l.videoUrl?.trim()));
  const testRequired = m.tests.length > 0;
  const practiceRequired = m.practicalTasks.length > 0;
  const totalSteps =
    Number(lessonRequired) + Number(videoRequired) + Number(testRequired) + Number(practiceRequired);
  return { lessonRequired, videoRequired, testRequired, practiceRequired, totalSteps };
}

function countCompletedSteps(
  req: ModuleRequirements,
  p: Pick<
    Progress,
    "lessonCompleted" | "videoCompleted" | "testCompleted" | "practiceCompleted"
  >,
): number {
  let n = 0;
  if (req.lessonRequired && p.lessonCompleted) n++;
  if (req.videoRequired && p.videoCompleted) n++;
  if (req.testRequired && p.testCompleted) n++;
  if (req.practiceRequired && p.practiceCompleted) n++;
  return n;
}

export function moduleProgressPercent(req: ModuleRequirements, p: ProgressRow | null): number {
  if (req.totalSteps <= 0) return 0;
  const row = p ?? defaultProgressRow();
  return Math.round((countCompletedSteps(req, row) / req.totalSteps) * 100);
}

/** Доля шагов модуля (лекция, видео, тест, практика) для UI. */
export function moduleStepProgress(
  req: ModuleRequirements,
  p: ProgressRow | null,
): { percent: number; completed: number; total: number } {
  const row = p ?? defaultProgressRow();
  const completed = countCompletedSteps(req, row);
  const total = req.totalSteps;
  const percent = total <= 0 ? 0 : Math.round((completed / total) * 100);
  return { percent, completed, total };
}

function defaultProgressRow(): ProgressRow {
  return {
    id: "",
    userId: "",
    moduleId: "",
    lessonCompleted: false,
    videoCompleted: false,
    testCompleted: false,
    practiceCompleted: false,
    moduleCompleted: false,
    score: 0,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
}

export async function loadModuleForProgress(moduleId: string): Promise<ModuleForProgress | null> {
  return prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      id: true,
      courseId: true,
      orderNumber: true,
      isActive: true,
      lessons: { select: { videoUrl: true } },
      tests: { select: { id: true } },
      practicalTasks: { select: { id: true } },
    },
  });
}

async function computeScoreFromSources(userId: string, m: ModuleForProgress): Promise<number> {
  let score = 0;
  for (const t of m.tests) {
    const best = await prisma.testAttempt.findFirst({
      where: { userId, testId: t.id, passed: true },
      orderBy: { score: "desc" },
      select: { score: true },
    });
    score += best?.score ?? 0;
  }
  for (const pt of m.practicalTasks) {
    const sub = await prisma.submission.findFirst({
      where: { userId, practicalTaskId: pt.id, status: "ACCEPTED", score: { not: null } },
      orderBy: { updatedAt: "desc" },
      select: { score: true },
    });
    score += sub?.score ?? 0;
  }
  return score;
}

/** По каждой практике последняя не-черновая отправка должна быть ACCEPTED (иначе доработка/отклонение сбрасывает зачёт). */
async function allPracticalAccepted(userId: string, taskIds: string[]): Promise<boolean> {
  if (taskIds.length === 0) return true;
  for (const tid of taskIds) {
    const latest = await prisma.submission.findFirst({
      where: { userId, practicalTaskId: tid, status: { not: "DRAFT" } },
      orderBy: { createdAt: "desc" },
      select: { status: true },
    });
    if (!latest || latest.status !== "ACCEPTED") return false;
  }
  return true;
}

/** Все тесты модуля пройдены (passed). */
export async function allTestsPassed(userId: string, testIds: string[]): Promise<boolean> {
  if (testIds.length === 0) return true;
  for (const id of testIds) {
    const ok = await prisma.testAttempt.findFirst({
      where: { userId, testId: id, passed: true },
      select: { id: true },
    });
    if (!ok) return false;
  }
  return true;
}

/**
 * Первый активный модуль курса (минимальный orderNumber) всегда открыт.
 * Остальные — только после завершения предыдущего активного модуля по порядку.
 */
export async function isModuleUnlocked(userId: string, moduleId: string): Promise<boolean> {
  const m = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true, courseId: true, orderNumber: true, isActive: true },
  });
  if (!m?.isActive) return false;

  const first = await prisma.module.findFirst({
    where: { courseId: m.courseId, isActive: true },
    orderBy: { orderNumber: "asc" },
    select: { id: true },
  });
  if (first && m.id === first.id) return true;

  const prev = await prisma.module.findFirst({
    where: { courseId: m.courseId, isActive: true, orderNumber: { lt: m.orderNumber } },
    orderBy: { orderNumber: "desc" },
    select: { id: true },
  });
  if (!prev) return true;

  const p = await prisma.progress.findUnique({
    where: { userId_moduleId: { userId, moduleId: prev.id } },
    select: { moduleCompleted: true },
  });
  return p?.moduleCompleted === true;
}

export type ModuleProgressResult = {
  moduleId: string;
  requirements: ModuleRequirements;
  progress: ProgressRow | null;
  progressPercent: number;
  moduleCompleted: boolean;
};

export async function getModuleProgress(userId: string, moduleId: string): Promise<ModuleProgressResult | null> {
  const m = await loadModuleForProgress(moduleId);
  if (!m || !m.isActive) return null;
  const req = getModuleRequirements(m);
  const progress = await prisma.progress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
    select: progressSelect,
  });
  const pct = moduleProgressPercent(req, progress);
  return {
    moduleId,
    requirements: req,
    progress,
    progressPercent: pct,
    moduleCompleted: progress?.moduleCompleted ?? false,
  };
}

export type CourseProgressModuleRow = {
  module: Pick<Module, "id" | "title" | "description" | "orderNumber">;
  requirements: ModuleRequirements;
  progress: ProgressRow | null;
  unlocked: boolean;
  progressPercent: number;
  score: number;
  moduleCompleted: boolean;
};

export type UserCourseProgressResult = {
  course: { id: string; title: string; description: string | null };
  overallProgressPercent: number;
  totalScore: number;
  modules: CourseProgressModuleRow[];
};

/**
 * Прогресс по курсу: заголовок, сумма баллов, доля завершённых модулей, список модулей с разблокировкой.
 */
export async function getUserCourseProgress(
  userId: string,
  courseId: string,
): Promise<UserCourseProgressResult | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, description: true },
  });
  if (!course) return null;

  const modules = await prisma.module.findMany({
    where: { courseId, isActive: true },
    orderBy: { orderNumber: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      orderNumber: true,
      courseId: true,
      isActive: true,
      lessons: { select: { videoUrl: true } },
      tests: { select: { id: true } },
      practicalTasks: { select: { id: true } },
    },
  });

  const moduleIds = modules.map((x) => x.id);
  const progressRows =
    moduleIds.length > 0
      ? await prisma.progress.findMany({
          where: { userId, moduleId: { in: moduleIds } },
          select: progressSelect,
        })
      : [];
  const byModule = new Map(progressRows.map((r) => [r.moduleId, r]));

  let chainUnlocked = true;
  const rows: CourseProgressModuleRow[] = [];

  for (const m of modules) {
    const unlocked: boolean = chainUnlocked;
    chainUnlocked = unlocked && Boolean(byModule.get(m.id)?.moduleCompleted);

    const req = getModuleRequirements(m);
    const p = byModule.get(m.id) ?? null;
    const progressPercent = unlocked ? moduleProgressPercent(req, p) : 0;
    const score = p?.score ?? 0;
    const moduleCompleted = Boolean(p?.moduleCompleted);

    rows.push({
      module: { id: m.id, title: m.title, description: m.description, orderNumber: m.orderNumber },
      requirements: req,
      progress: p,
      unlocked,
      progressPercent,
      score,
      moduleCompleted,
    });
  }

  const totalScore = rows.reduce((a, r) => a + r.score, 0);
  const completedModules = rows.filter((r) => r.moduleCompleted).length;
  const overallProgressPercent = rows.length ? Math.round((completedModules / rows.length) * 100) : 0;

  return {
    course,
    overallProgressPercent,
    totalScore,
    modules: rows,
  };
}

async function ensureProgressRow(userId: string, moduleId: string): Promise<ProgressRow> {
  return prisma.progress.upsert({
    where: { userId_moduleId: { userId, moduleId } },
    create: {
      userId,
      moduleId,
      lessonCompleted: false,
      videoCompleted: false,
      testCompleted: false,
      practiceCompleted: false,
      moduleCompleted: false,
      score: 0,
    },
    update: {},
    select: progressSelect,
  });
}

/**
 * Синхронизирует флаги теста/практики с фактами в БД, пересчитывает %, `moduleCompleted`, баллы.
 *
 * **Единственный** штатный путь выставления `moduleCompleted` и `practiceCompleted` по фактам отправок и тестов.
 * Клиент не может «закрыть модуль» без прохождения этой функции на сервере.
 */
export async function recalculateModuleProgress(userId: string, moduleId: string): Promise<ModuleProgressResult | null> {
  const m = await loadModuleForProgress(moduleId);
  if (!m || !m.isActive) return null;

  if (!(await isModuleUnlocked(userId, moduleId))) {
    return getModuleProgress(userId, moduleId);
  }

  const req = getModuleRequirements(m);
  const row = await ensureProgressRow(userId, moduleId);

  const testIds = m.tests.map((t) => t.id);
  const taskIds = m.practicalTasks.map((t) => t.id);

  const testsDone = await allTestsPassed(userId, testIds);
  const practiceDone = await allPracticalAccepted(userId, taskIds);

  const merged: Pick<
    Progress,
    "lessonCompleted" | "videoCompleted" | "testCompleted" | "practiceCompleted"
  > = {
    lessonCompleted: row.lessonCompleted,
    videoCompleted: row.videoCompleted,
    testCompleted: req.testRequired ? testsDone : false,
    practiceCompleted: req.practiceRequired ? practiceDone : false,
  };

  const done = countCompletedSteps(req, merged);
  const moduleCompleted = req.totalSteps > 0 && done === req.totalSteps;
  const progressPercent = moduleProgressPercent(req, {
    ...row,
    ...merged,
    moduleCompleted,
    score: row.score,
  });
  const score = await computeScoreFromSources(userId, m);

  const updated = await prisma.progress.update({
    where: { userId_moduleId: { userId, moduleId } },
    data: {
      testCompleted: req.testRequired ? testsDone : row.testCompleted,
      practiceCompleted: req.practiceRequired ? practiceDone : row.practiceCompleted,
      moduleCompleted,
      score,
    },
    select: progressSelect,
  });

  if (moduleCompleted) {
    await unlockNextModule(userId, moduleId);
  }

  await reconcileUserAchievements(userId);

  return {
    moduleId,
    requirements: req,
    progress: updated,
    progressPercent,
    moduleCompleted,
  };
}

/**
 * Создаёт запись прогресса для следующего модуля (если есть), чтобы дальнейшие обновления шли без гонок.
 */
export async function unlockNextModule(userId: string, moduleId: string): Promise<string | null> {
  const cur = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true, orderNumber: true },
  });
  if (!cur) return null;

  const next = await prisma.module.findFirst({
    where: { courseId: cur.courseId, orderNumber: { gt: cur.orderNumber }, isActive: true },
    orderBy: { orderNumber: "asc" },
    select: { id: true },
  });
  if (!next) return null;

  await prisma.progress.upsert({
    where: { userId_moduleId: { userId, moduleId: next.id } },
    create: {
      userId,
      moduleId: next.id,
    },
    update: {},
  });

  return next.id;
}

async function guardUnlocked(userId: string, moduleId: string): Promise<boolean> {
  return isModuleUnlocked(userId, moduleId);
}

export async function completeLesson(userId: string, moduleId: string): Promise<boolean> {
  if (!(await guardUnlocked(userId, moduleId))) return false;
  await ensureProgressRow(userId, moduleId);
  await prisma.progress.update({
    where: { userId_moduleId: { userId, moduleId } },
    data: { lessonCompleted: true },
  });
  await recalculateModuleProgress(userId, moduleId);
  return true;
}

export async function completeVideo(userId: string, moduleId: string): Promise<boolean> {
  if (!(await guardUnlocked(userId, moduleId))) return false;
  const m = await loadModuleForProgress(moduleId);
  if (!m) return false;
  const req = getModuleRequirements(m);
  if (!req.videoRequired) return true;
  await ensureProgressRow(userId, moduleId);
  await prisma.progress.update({
    where: { userId_moduleId: { userId, moduleId } },
    data: { videoCompleted: true },
  });
  await recalculateModuleProgress(userId, moduleId);
  return true;
}

export async function completeTest(userId: string, moduleId: string): Promise<boolean> {
  if (!(await guardUnlocked(userId, moduleId))) return false;
  await recalculateModuleProgress(userId, moduleId);
  return true;
}

export async function completePractice(userId: string, moduleId: string): Promise<boolean> {
  if (!(await guardUnlocked(userId, moduleId))) return false;
  await recalculateModuleProgress(userId, moduleId);
  return true;
}

/** Пересчёт прогресса по всем модулям курса (по порядку), затем агрегат для UI. */
export async function syncAndGetUserCourseProgress(
  userId: string,
  courseId: string,
): Promise<UserCourseProgressResult | null> {
  const ordered = await prisma.module.findMany({
    where: { courseId, isActive: true },
    orderBy: { orderNumber: "asc" },
    select: { id: true },
  });
  for (const { id } of ordered) {
    await recalculateModuleProgress(userId, id);
  }
  return getUserCourseProgress(userId, courseId);
}

export async function getDefaultCourseForDashboard(): Promise<{ id: string; title: string; description: string | null } | null> {
  return prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, description: true },
  });
}

