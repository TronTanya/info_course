import type { SubmissionStatus } from "@prisma/client";
import type { PracticalTaskType } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  estimatePracticeMinutes,
  formatPracticeDuration,
  practiceDifficultyLabel,
} from "@/lib/practice-lab-ui";
import {
  estimateTestMinutes,
  formatTestDuration,
  getTestCardStatus,
  testStatusMeta,
  type TestCardStatus,
} from "@/lib/test-ui";
import { getModuleRequirements, isModuleUnlocked, type ModuleRequirements, type ProgressRow } from "@/lib/progress";

export type LessonContentStatus = "locked" | "not_started" | "in_progress" | "completed";

export type PracticeContentStatus =
  | "locked"
  | "not_started"
  | "submitted"
  | "pending_review"
  | "approved"
  | "needs_retry";

export type ModuleContentListData = {
  moduleId: string;
  lessons: LessonContentItemView[];
  test: TestContentItemView | null;
  practices: PracticeContentItemView[];
};

export type LessonContentItemView = {
  id: string;
  title: string;
  status: LessonContentStatus;
  statusLabel: string;
  readingTimeLabel: string;
  hasVideo: boolean;
  href: string;
  ctaLabel: string;
  ctaDisabled: boolean;
};

export type TestContentItemView = {
  id: string;
  title: string;
  status: TestCardStatus | "locked";
  statusLabel: string;
  questionCount: number;
  questionCountLabel: string;
  durationLabel: string;
  href: string;
  ctaLabel: string;
  ctaDisabled: boolean;
};

export type PracticeContentItemView = {
  id: string;
  title: string;
  status: PracticeContentStatus;
  statusLabel: string;
  difficultyLabel: string;
  durationLabel: string;
  href: string;
  ctaLabel: string;
  ctaDisabled: boolean;
};

const lessonStatusLabels: Record<LessonContentStatus, string> = {
  locked: "Закрыто",
  not_started: "Не начато",
  in_progress: "В процессе",
  completed: "Пройдено",
};

const practiceStatusLabels: Record<PracticeContentStatus, string> = {
  locked: "Закрыто",
  not_started: "Не начато",
  submitted: "Отправлено",
  pending_review: "На проверке",
  approved: "Зачтено",
  needs_retry: "Нужны правки",
};

const testStatusLabels: Record<TestCardStatus | "locked", string> = {
  locked: "Закрыто",
  not_started: "Не начат",
  in_progress: "В процессе",
  passed: "Пройден",
  failed: "Не пройден",
};

/** Оценка времени чтения без передачи текста лекции на клиент. */
export function estimateLessonReadingMinutes(contentCharCount: number, hasVideo: boolean): number {
  const words = Math.max(1, Math.round(contentCharCount / 5));
  const readMin = Math.max(5, Math.ceil(words / 180));
  const videoMin = hasVideo ? 12 : 0;
  return readMin + videoMin;
}

export function formatLessonReadingTime(minutes: number, hasVideo: boolean): string {
  const base = minutes < 60 ? `~${minutes} мин` : `~${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
  return hasVideo ? `${base} · с видео` : base;
}

function lessonDone(req: ModuleRequirements, p: ProgressRow | null): boolean {
  const lessonOk = !req.lessonRequired || Boolean(p?.lessonCompleted);
  const videoOk = !req.videoRequired || Boolean(p?.videoCompleted);
  return lessonOk && videoOk;
}

function testBlocked(req: ModuleRequirements, unlocked: boolean, p: ProgressRow | null): boolean {
  if (!unlocked || !req.testRequired) return true;
  return !lessonDone(req, p);
}

function practiceBlocked(req: ModuleRequirements, unlocked: boolean, p: ProgressRow | null): boolean {
  if (!unlocked || !req.practiceRequired) return true;
  return !req.testRequired || !Boolean(p?.testCompleted);
}

function mapPracticeStatus(
  locked: boolean,
  practiceCompleted: boolean,
  submissionStatus: SubmissionStatus | null,
): PracticeContentStatus {
  if (locked) return "locked";
  if (practiceCompleted) return "approved";
  if (!submissionStatus || submissionStatus === "DRAFT") return "not_started";
  if (submissionStatus === "ACCEPTED") return "approved";
  if (submissionStatus === "SUBMITTED") return "submitted";
  if (submissionStatus === "CHECKING") return "pending_review";
  if (submissionStatus === "REJECTED" || submissionStatus === "NEEDS_REVISION") return "needs_retry";
  return "not_started";
}

function lessonCta(status: LessonContentStatus): { label: string; disabled: boolean } {
  if (status === "locked") return { label: "Заблокировано", disabled: true };
  if (status === "completed") return { label: "Повторить материал", disabled: false };
  if (status === "in_progress") return { label: "Продолжить урок", disabled: false };
  return { label: "Начать урок", disabled: false };
}

function testCta(status: TestCardStatus | "locked"): { label: string; disabled: boolean } {
  if (status === "locked") return { label: "Заблокировано", disabled: true };
  if (status === "passed") return { label: "Открыть тест", disabled: false };
  if (status === "failed") return { label: "Повторить тест", disabled: false };
  if (status === "in_progress") return { label: "Продолжить тест", disabled: false };
  return { label: "Пройти тест", disabled: false };
}

function practiceCta(status: PracticeContentStatus): { label: string; disabled: boolean } {
  if (status === "locked") return { label: "Заблокировано", disabled: true };
  if (status === "approved") return { label: "Открыть практику", disabled: false };
  if (status === "pending_review" || status === "submitted") return { label: "Посмотреть статус", disabled: false };
  if (status === "needs_retry") return { label: "Повторить практику", disabled: false };
  return { label: "Открыть практику", disabled: false };
}

function questionCountLabel(count: number): string {
  if (count <= 0) return "Вопросы появятся позже";
  const n = count;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} вопрос`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} вопроса`;
  return `${n} вопросов`;
}

export function buildModuleContentListView(input: {
  moduleId: string;
  moduleOrderNumber: number;
  unlocked: boolean;
  requirements: ModuleRequirements;
  progress: ProgressRow | null;
  lessons: { id: string; title: string; contentLength: number; hasVideo: boolean }[];
  tests: { id: string; title: string; questionCount: number; lastAttempt: { passed: boolean } | null }[];
  practices: {
    id: string;
    title: string;
    taskType: PracticalTaskType;
    maxScore: number;
    submissionStatus: SubmissionStatus | null;
  }[];
}): ModuleContentListData {
  const { moduleId, moduleOrderNumber, unlocked, requirements: req, progress: p } = input;
  const base = `/dashboard/course/${moduleId}`;
  const lectureLocked = !unlocked;

  const lessons: LessonContentItemView[] = input.lessons.map((lesson) => {
    let status: LessonContentStatus;
    if (lectureLocked) {
      status = "locked";
    } else if (lessonDone(req, p)) {
      status = "completed";
    } else if (p?.lessonCompleted || p?.videoCompleted) {
      status = "in_progress";
    } else {
      status = "not_started";
    }
    const cta = lessonCta(status);
    const minutes = estimateLessonReadingMinutes(lesson.contentLength, lesson.hasVideo);
    return {
      id: lesson.id,
      title: lesson.title,
      status,
      statusLabel: lessonStatusLabels[status],
      readingTimeLabel: formatLessonReadingTime(minutes, lesson.hasVideo),
      hasVideo: lesson.hasVideo,
      href: `${base}/lesson`,
      ctaLabel: cta.label,
      ctaDisabled: cta.disabled,
    };
  });

  let test: TestContentItemView | null = null;
  const testRow = input.tests[0];
  if (req.testRequired && testRow) {
    const blocked = testBlocked(req, unlocked, p);
    const cardStatus: TestCardStatus | "locked" = blocked
      ? "locked"
      : p?.testCompleted
        ? "passed"
        : getTestCardStatus(testRow.lastAttempt);
    const cta = testCta(cardStatus);
    const qCount = testRow.questionCount;
    test = {
      id: testRow.id,
      title: testRow.title,
      status: cardStatus,
      statusLabel: blocked ? testStatusLabels.locked : testStatusMeta[cardStatus as TestCardStatus]?.label ?? testStatusLabels[cardStatus],
      questionCount: qCount,
      questionCountLabel: questionCountLabel(qCount),
      durationLabel: formatTestDuration(estimateTestMinutes(qCount)),
      href: `${base}/test`,
      ctaLabel: cta.label,
      ctaDisabled: cta.disabled,
    };
  }

  const practices: PracticeContentItemView[] = input.practices.map((task) => {
    const blocked = practiceBlocked(req, unlocked, p);
    const status = mapPracticeStatus(blocked, Boolean(p?.practiceCompleted), task.submissionStatus);
    const cta = practiceCta(status);
    const minutes = estimatePracticeMinutes(task.taskType, task.maxScore);
    return {
      id: task.id,
      title: task.title,
      status,
      statusLabel: practiceStatusLabels[status],
      difficultyLabel: practiceDifficultyLabel(moduleOrderNumber, task.maxScore),
      durationLabel: formatPracticeDuration(minutes),
      href: `${base}/practice`,
      ctaLabel: cta.label,
      ctaDisabled: cta.disabled,
    };
  });

  return { moduleId, lessons, test, practices };
}

/** Загрузка публичных метаданных модуля для списка контента (без ответов и разборов). */
export async function loadModuleContentListData(
  userId: string,
  moduleId: string,
): Promise<{
  module: {
    orderNumber: number;
    requirements: ModuleRequirements;
    progress: ProgressRow | null;
    unlocked: boolean;
  };
  payload: Omit<Parameters<typeof buildModuleContentListView>[0], "moduleId" | "moduleOrderNumber" | "unlocked" | "requirements" | "progress">;
} | null> {
  const courseModule = await prisma.module.findUnique({
    where: { id: moduleId },
    select: {
      id: true,
      orderNumber: true,
      isActive: true,
      lessons: { select: { id: true, title: true, content: true, videoUrl: true } },
      tests: {
        select: {
          id: true,
          title: true,
          _count: { select: { questions: true } },
        },
      },
      practicalTasks: {
        orderBy: { createdAt: "asc" },
        select: { id: true, title: true, taskType: true, maxScore: true },
      },
    },
  });

  if (!courseModule?.isActive) return null;

  const requirements = getModuleRequirements({
    id: courseModule.id,
    courseId: "",
    orderNumber: courseModule.orderNumber,
    isActive: true,
    lessons: courseModule.lessons.map((l) => ({ videoUrl: l.videoUrl })),
    tests: courseModule.tests.map((t) => ({ id: t.id })),
    practicalTasks: courseModule.practicalTasks.map((t) => ({ id: t.id })),
  });

  const unlocked = await isModuleUnlocked(userId, moduleId);
  const progress = await prisma.progress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
    select: {
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
    },
  });

  const testIds = courseModule.tests.map((t) => t.id);
  const taskIds = courseModule.practicalTasks.map((t) => t.id);

  const [testAttempts, submissions] = await Promise.all([
    testIds.length > 0
      ? prisma.testAttempt.findMany({
          where: { userId, testId: { in: testIds } },
          orderBy: { createdAt: "desc" },
          select: { testId: true, passed: true },
        })
      : [],
    taskIds.length > 0
      ? prisma.submission.findMany({
          where: { userId, practicalTaskId: { in: taskIds }, status: { not: "DRAFT" } },
          orderBy: { createdAt: "desc" },
          select: { practicalTaskId: true, status: true },
        })
      : [],
  ]);

  const lastAttemptByTest = new Map<string, { passed: boolean }>();
  for (const a of testAttempts) {
    if (!lastAttemptByTest.has(a.testId)) lastAttemptByTest.set(a.testId, { passed: a.passed });
  }

  const latestSubByTask = new Map<string, SubmissionStatus>();
  for (const s of submissions) {
    if (!latestSubByTask.has(s.practicalTaskId)) latestSubByTask.set(s.practicalTaskId, s.status);
  }

  return {
    module: {
      orderNumber: courseModule.orderNumber,
      requirements,
      progress,
      unlocked,
    },
    payload: {
      lessons: courseModule.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        contentLength: l.content.length,
        hasVideo: Boolean(l.videoUrl?.trim()),
      })),
      tests: courseModule.tests.map((t) => ({
        id: t.id,
        title: t.title,
        questionCount: t._count.questions,
        lastAttempt: lastAttemptByTest.get(t.id) ?? null,
      })),
      practices: courseModule.practicalTasks.map((t) => ({
        id: t.id,
        title: t.title,
        taskType: t.taskType,
        maxScore: t.maxScore,
        submissionStatus: latestSubByTask.get(t.id) ?? null,
      })),
    },
  };
}

export async function getModuleContentListData(
  userId: string,
  moduleId: string,
): Promise<ModuleContentListData | null> {
  const loaded = await loadModuleContentListData(userId, moduleId);
  if (!loaded) return null;
  return buildModuleContentListView({
    moduleId,
    moduleOrderNumber: loaded.module.orderNumber,
    unlocked: loaded.module.unlocked,
    requirements: loaded.module.requirements,
    progress: loaded.module.progress,
    ...loaded.payload,
  });
}
