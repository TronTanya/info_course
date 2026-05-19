import type { QuestionType, SubmissionStatus } from "@prisma/client";
import { canGenerateCertificate, certificateVerifyUrl } from "@/lib/certificate";
import { prisma } from "@/lib/db";
import { questionCountsTowardAutoScore } from "@/lib/test-grading";

export type ProfileLastLesson = {
  lessonTitle: string;
  moduleTitle: string;
  at: string;
} | null;

export type ProfileLastTest = {
  testTitle: string;
  moduleTitle: string;
  passed: boolean;
  percent: number;
  at: string;
} | null;

export type ProfileLastPractice = {
  taskTitle: string;
  moduleTitle: string;
  status: SubmissionStatus;
  statusLabel: string;
  at: string;
} | null;

/** Сводка «последняя активность» — самое свежее событие из лекции / теста / практики. */
export type ProfileLastActivitySummary = {
  kind: "lesson" | "test" | "practice";
  label: string;
  detail: string;
  at: string;
} | null;

/** Сертификат в интерфейсе профиля. */
export type ProfileCertificateDisplayState = "unavailable" | "available" | "issued";

export type ProfileCompletedModule = {
  id: string;
  title: string;
  orderNumber: number;
};

export type ProfileCourseStats = {
  courseId: string;
  courseTitle: string;
  completedModules: number;
  totalModules: number;
  progressPercent: number;
  totalPoints: number;
  maxPossiblePoints: number;
  scoreSuccessPercent: number;
  /** Средний процент по всем попыткам тестов курса (null — попыток не было). */
  averageTestPercent: number | null;
  testAttemptCount: number;
  testsPassedCount: number;
  /** Модули с зачтённой практикой (по progress.practiceCompleted). */
  practicesCompleted: number;
  practicesTotal: number;
  completedModuleRows: ProfileCompletedModule[];
  currentModuleTitle: string | null;
  currentModuleId: string | null;
  allModulesComplete: boolean;
  certificateIssued: boolean;
  certificateId: string | null;
  certificateNumber: string | null;
  certificateVerifyUrl: string | null;
  issuedAt: Date | null;
  canGenerateCertificate: boolean;
  modulesUntilCertificate: number;
  lastLesson: ProfileLastLesson;
  lastTest: ProfileLastTest;
  lastPractice: ProfileLastPractice;
  lastActivitySummary: ProfileLastActivitySummary;
  certificateDisplayState: ProfileCertificateDisplayState;
};

function submissionStatusLabel(s: SubmissionStatus): string {
  const m: Record<SubmissionStatus, string> = {
    DRAFT: "Черновик",
    SUBMITTED: "Отправлено",
    CHECKING: "На проверке",
    ACCEPTED: "Принято",
    REJECTED: "Отклонено",
    NEEDS_REVISION: "На доработку",
  };
  return m[s] ?? s;
}

function maxPointsForQuestion(q: {
  points: number;
  questionType: QuestionType;
  textManualGrading: boolean;
}): number {
  return questionCountsTowardAutoScore(q) ? q.points : 0;
}

/**
 * Агрегаты по основному курсу (первый курс в БД) для экрана профиля:
 * прогресс, баллы, «текущий» модуль, последняя активность, сертификат.
 */
export async function getProfileCourseStats(userId: string): Promise<ProfileCourseStats | null> {
  const course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true },
  });
  if (!course) return null;

  const modules = await prisma.module.findMany({
    where: { courseId: course.id, isActive: true },
    orderBy: { orderNumber: "asc" },
    select: {
      id: true,
      title: true,
      orderNumber: true,
      lessons: { orderBy: { createdAt: "asc" }, take: 1, select: { id: true, title: true } },
      tests: {
        select: {
          questions: {
            select: { points: true, questionType: true, textManualGrading: true },
          },
        },
      },
      practicalTasks: { select: { maxScore: true } },
    },
  });

  const moduleIds = modules.map((m) => m.id);

  let maxPossiblePoints = 0;
  for (const m of modules) {
    for (const t of m.tests) {
      for (const q of t.questions) {
        maxPossiblePoints += maxPointsForQuestion(q);
      }
    }
    for (const pt of m.practicalTasks) {
      maxPossiblePoints += pt.maxScore;
    }
  }

  const [progressRows, lastLessonProgress, lastAttempt, lastSubmission, certificate, canCert, testAttempts] =
    await Promise.all([
    moduleIds.length
      ? prisma.progress.findMany({
          where: { userId, moduleId: { in: moduleIds } },
        })
      : Promise.resolve([]),
    moduleIds.length
      ? prisma.progress.findFirst({
          where: { userId, lessonCompleted: true, moduleId: { in: moduleIds } },
          orderBy: { updatedAt: "desc" },
          select: {
            updatedAt: true,
            module: {
              select: {
                title: true,
                lessons: { orderBy: { createdAt: "asc" }, take: 1, select: { title: true } },
              },
            },
          },
        })
      : Promise.resolve(null),
    moduleIds.length
      ? prisma.testAttempt.findFirst({
          where: { userId, test: { moduleId: { in: moduleIds } } },
          orderBy: { createdAt: "desc" },
          select: {
            createdAt: true,
            passed: true,
            score: true,
            maxScore: true,
            test: { select: { title: true, module: { select: { title: true } } } },
          },
        })
      : Promise.resolve(null),
    moduleIds.length
      ? prisma.submission.findFirst({
          where: {
            userId,
            status: { not: "DRAFT" },
            practicalTask: { moduleId: { in: moduleIds } },
          },
          orderBy: { createdAt: "desc" },
          select: {
            createdAt: true,
            status: true,
            practicalTask: { select: { title: true, module: { select: { title: true } } } },
          },
        })
      : Promise.resolve(null),
    prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
      select: { id: true, certificateNumber: true, issuedAt: true, verificationCode: true },
    }),
    canGenerateCertificate(userId, course.id),
    moduleIds.length
      ? prisma.testAttempt.findMany({
          where: { userId, test: { moduleId: { in: moduleIds } } },
          select: { score: true, maxScore: true, passed: true },
        })
      : Promise.resolve([]),
  ]);

  const byModule = new Map(progressRows.map((p) => [p.moduleId, p]));

  let completed = 0;
  let totalPoints = 0;
  let practicesCompleted = 0;
  let practicesTotal = 0;
  const completedModuleRows: ProfileCompletedModule[] = [];

  for (const m of modules) {
    const p = byModule.get(m.id);
    totalPoints += p?.score ?? 0;
    if (m.practicalTasks.length > 0) {
      practicesTotal++;
      if (p?.practiceCompleted) practicesCompleted++;
    }
    if (p?.moduleCompleted) {
      completed++;
      completedModuleRows.push({ id: m.id, title: m.title, orderNumber: m.orderNumber });
    }
  }

  const total = modules.length;
  const progressPercent = total ? Math.round((completed / total) * 100) : 0;
  const modulesUntilCertificate = Math.max(0, total - completed);
  const allModulesComplete = total > 0 && completed === total;

  let currentModuleTitle: string | null = null;
  let currentModuleId: string | null = null;
  for (const m of modules) {
    const p = byModule.get(m.id);
    if (!p || !p.moduleCompleted) {
      currentModuleTitle = m.title;
      currentModuleId = m.id;
      break;
    }
  }
  if (total > 0 && allModulesComplete) {
    currentModuleTitle = "Все модули завершены";
    currentModuleId = null;
  }

  const scoreSuccessPercent =
    maxPossiblePoints > 0 ? Math.min(100, Math.round((totalPoints / maxPossiblePoints) * 100)) : 0;

  const scoredAttempts = testAttempts.filter((a) => a.maxScore > 0);
  const averageTestPercent =
    scoredAttempts.length > 0
      ? Math.round(
          scoredAttempts.reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0) / scoredAttempts.length,
        )
      : null;
  const testAttemptCount = testAttempts.length;
  const testsPassedCount = testAttempts.filter((a) => a.passed).length;

  const lastLesson: ProfileLastLesson = lastLessonProgress?.module.lessons[0]
    ? {
        lessonTitle: lastLessonProgress.module.lessons[0].title,
        moduleTitle: lastLessonProgress.module.title,
        at: lastLessonProgress.updatedAt.toISOString(),
      }
    : null;

  const lastTest: ProfileLastTest = lastAttempt
    ? {
        testTitle: lastAttempt.test.title,
        moduleTitle: lastAttempt.test.module.title,
        passed: lastAttempt.passed,
        percent:
          lastAttempt.maxScore > 0 ? Math.round((lastAttempt.score / lastAttempt.maxScore) * 100) : 0,
        at: lastAttempt.createdAt.toISOString(),
      }
    : null;

  const lastPractice: ProfileLastPractice = lastSubmission
    ? {
        taskTitle: lastSubmission.practicalTask.title,
        moduleTitle: lastSubmission.practicalTask.module.title,
        status: lastSubmission.status,
        statusLabel: submissionStatusLabel(lastSubmission.status),
        at: lastSubmission.createdAt.toISOString(),
      }
    : null;

  const activityCandidates: {
    at: Date;
    kind: "lesson" | "test" | "practice";
    label: string;
    detail: string;
  }[] = [];

  if (lastLessonProgress?.module.lessons[0]) {
    activityCandidates.push({
      at: lastLessonProgress.updatedAt,
      kind: "lesson",
      label: "Лекция",
      detail: `«${lastLessonProgress.module.lessons[0].title}» · ${lastLessonProgress.module.title}`,
    });
  }
  if (lastAttempt) {
    activityCandidates.push({
      at: lastAttempt.createdAt,
      kind: "test",
      label: "Тест",
      detail: `«${lastAttempt.test.title}» · ${lastAttempt.test.module.title}`,
    });
  }
  if (lastSubmission) {
    activityCandidates.push({
      at: lastSubmission.createdAt,
      kind: "practice",
      label: "Практика",
      detail: `«${lastSubmission.practicalTask.title}» · ${lastSubmission.practicalTask.module.title}`,
    });
  }

  let lastActivitySummary: ProfileLastActivitySummary = null;
  if (activityCandidates.length > 0) {
    activityCandidates.sort((a, b) => b.at.getTime() - a.at.getTime());
    const top = activityCandidates[0]!;
    lastActivitySummary = {
      kind: top.kind,
      label: top.label,
      detail: top.detail,
      at: top.at.toISOString(),
    };
  }

  const certificateIssued = Boolean(certificate);
  const verifyUrl = certificate ? certificateVerifyUrl(certificate.verificationCode) : null;

  const certificateDisplayState: ProfileCertificateDisplayState = certificateIssued
    ? "issued"
    : canCert && !certificateIssued
      ? "available"
      : "unavailable";

  return {
    courseId: course.id,
    courseTitle: course.title,
    completedModules: completed,
    totalModules: total,
    progressPercent,
    totalPoints,
    maxPossiblePoints,
    scoreSuccessPercent,
    averageTestPercent,
    testAttemptCount,
    testsPassedCount,
    practicesCompleted,
    practicesTotal,
    completedModuleRows,
    currentModuleTitle,
    currentModuleId,
    allModulesComplete,
    certificateIssued,
    certificateId: certificate?.id ?? null,
    certificateNumber: certificate?.certificateNumber ?? null,
    certificateVerifyUrl: verifyUrl,
    issuedAt: certificate?.issuedAt ?? null,
    canGenerateCertificate: canCert && !certificateIssued,
    modulesUntilCertificate,
    lastLesson,
    lastTest,
    lastPractice,
    lastActivitySummary,
    certificateDisplayState,
  };
}
