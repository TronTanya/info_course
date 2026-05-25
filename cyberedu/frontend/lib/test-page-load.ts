import type { LearningStepLink } from "@/lib/learning-nav";
import { buildLearningPageContext, type LearningPageContext } from "@/lib/learning-context";
import { getCertificateDashboardState } from "@/lib/certificate";
import { buildCoursePageCertificateSummary } from "@/lib/course-page-summary";
import { computeStepMetrics } from "@/lib/dashboard-ui";
import {
  buildTestPageRelatedLessons,
  type TestPageLearningContext,
} from "@/lib/test-next-learning-step";
import { getDefaultCourseForDashboard, syncAndGetUserCourseProgress } from "@/lib/progress";
import {
  checkModuleAccessForApi,
  checkTestPrerequisites,
} from "@/lib/course-progress-guards";
import type { ClientTestQuestion } from "@/lib/test-grading";
import { isAiConfigured } from "@/lib/ai-config";
import { logError } from "@/lib/log/structured";
import { prisma } from "@/lib/db";
import { getModuleProgress } from "@/lib/progress";
import { testGateLockedReason } from "@/lib/test-page-state";
import type { TestModulePathStep } from "@/components/test/test-module-path-strip";
import type { TestPageEmptyKind, TestPageLoadErrorKind } from "@/lib/test-page-state";

function shuffleAnswerStubs<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export type TestRunnerPayload = {
  testId: string;
  title: string;
  moduleDescription: string | null;
  attemptCount: number;
  minScore: number;
  questions: ClientTestQuestion[];
  lastAttempt: {
    score: number;
    maxScore: number;
    passed: boolean;
    percent: number;
    createdAt: string;
  } | null;
};

export type TestPageOkPayload = {
  moduleId: string;
  moduleTitle: string;
  moduleOrderNumber: number;
  tests: TestRunnerPayload[];
  nextStep: LearningStepLink | null;
  modulePathSteps: TestModulePathStep[];
  learning: TestPageLearningContext;
  aiMentorConfigured: boolean;
};

export type TestPageLoadResult =
  | { status: "unauthorized" }
  | { status: "locked"; reason: string; moduleTitle?: string; lessonHref: string }
  | { status: "empty"; kind: TestPageEmptyKind; moduleTitle?: string; moduleId?: string }
  | { status: "error"; kind: TestPageLoadErrorKind }
  | { status: "ok"; data: TestPageOkPayload };

function safeErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 120);
  }
  return undefined;
}

/**
 * Загрузка страницы теста: без redirect на login, без технических деталей в UI.
 */
export async function loadTestPageData(
  userId: string | undefined,
  moduleId: string,
): Promise<TestPageLoadResult> {
  const lessonHref = `/dashboard/course/${moduleId}/lesson`;

  if (!userId) {
    return { status: "unauthorized" };
  }

  try {
    const access = await checkModuleAccessForApi(userId, moduleId);
    if (!access.ok) {
      return {
        status: "locked",
        reason: testGateLockedReason(access.code, access.message),
        lessonHref,
      };
    }

    const gate = await checkTestPrerequisites(userId, moduleId);
    if (!gate.ok) {
      return {
        status: "locked",
        reason: testGateLockedReason(gate.code, gate.message),
        lessonHref,
      };
    }

    const mod = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { title: true, orderNumber: true, description: true, isActive: true },
    });

    if (!mod?.isActive) {
      return { status: "empty", kind: "module_not_found", moduleId };
    }

    const tests = await prisma.test.findMany({
      where: { moduleId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        minScore: true,
        questions: {
          orderBy: { orderNumber: "asc" },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            points: true,
            orderNumber: true,
            textManualGrading: true,
            answers: {
              orderBy: { id: "asc" },
              select: { id: true, answerText: true },
            },
          },
        },
      },
    });

    if (tests.length === 0) {
      return {
        status: "empty",
        kind: "test_not_found",
        moduleTitle: mod.title,
        moduleId,
      };
    }

    const mp = await getModuleProgress(userId, moduleId);
    if (!mp) {
      return { status: "error", kind: "progress" };
    }

    let learning: LearningPageContext;
    try {
      learning = await buildLearningPageContext(
        userId,
        moduleId,
        `/dashboard/course/${moduleId}/test`,
        mp.requirements,
        mp.progress,
      );
    } catch (error) {
      logError("test_page_learning_context_failed", {
        userId,
        moduleId,
        code: safeErrorCode(error),
      });
      return { status: "error", kind: "load" };
    }

    const modulePathSteps = learning.steps.map((s) => ({
      kind: s.kind,
      title: s.title,
      status: s.status,
      isActive: s.kind === "test",
    }));

    const course = await getDefaultCourseForDashboard();
    const courseProgress = course ? await syncAndGetUserCourseProgress(userId, course.id) : null;
    const courseModules = courseProgress?.modules ?? [];
    const metrics = computeStepMetrics(courseModules);
    let certificate = buildCoursePageCertificateSummary(courseModules, metrics, null);
    try {
      const certState = await getCertificateDashboardState(userId);
      certificate = buildCoursePageCertificateSummary(courseModules, metrics, certState);
    } catch (error) {
      logError("test_page_certificate_load_failed", {
        userId,
        moduleId,
        code: safeErrorCode(error),
      });
    }

    const currentRow = courseModules.find((m) => m.module.id === moduleId);
    const allModulesComplete =
      courseModules.length > 0 && courseModules.every((m) => m.moduleCompleted);
    const practiceHref = `/dashboard/course/${moduleId}/practice`;
    const moduleHref = `/dashboard/course/${moduleId}`;
    const courseHref = "/dashboard/course";

    const pageLearning: TestPageLearningContext = {
      moduleId,
      moduleTitle: mod.title,
      courseTitle: learning.courseTitle,
      courseHref,
      lessonHref,
      practiceHref,
      moduleHref,
      hasPractice: Boolean(mp.requirements.practiceRequired),
      practiceRequired: Boolean(mp.requirements.practiceRequired),
      practiceCompleted: Boolean(mp.progress?.practiceCompleted),
      moduleCompleted: Boolean(currentRow?.moduleCompleted ?? mp.progress?.moduleCompleted),
      allModulesComplete,
      courseModules: learning.modules,
      relatedLessons: buildTestPageRelatedLessons(moduleId, mod.title),
      certificate,
    };

    const testsPayload: TestRunnerPayload[] = [];

    for (const t of tests) {
      if (t.questions.length === 0) {
        continue;
      }

      const [lastAttempt, attemptCount] = await Promise.all([
        prisma.testAttempt.findFirst({
          where: { userId, testId: t.id },
          orderBy: { createdAt: "desc" },
          select: { score: true, maxScore: true, passed: true, createdAt: true },
        }),
        prisma.testAttempt.count({ where: { userId, testId: t.id } }),
      ]);

      const percent =
        lastAttempt && lastAttempt.maxScore > 0
          ? Math.round((lastAttempt.score / lastAttempt.maxScore) * 100)
          : 0;

      testsPayload.push({
        testId: t.id,
        title: t.title,
        moduleDescription: mod.description ?? null,
        attemptCount,
        minScore: t.minScore,
        questions: t.questions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          points: q.points,
          orderNumber: q.orderNumber,
          manualTextGrading: q.questionType === "TEXT" && q.textManualGrading,
          answers:
            q.questionType === "TEXT"
              ? []
              : shuffleAnswerStubs(
                  q.answers.map((a) => ({ id: a.id, answerText: a.answerText })),
                ),
        })),
        lastAttempt: lastAttempt
          ? {
              score: lastAttempt.score,
              maxScore: lastAttempt.maxScore,
              passed: lastAttempt.passed,
              percent,
              createdAt: lastAttempt.createdAt.toISOString(),
            }
          : null,
      });
    }

    if (testsPayload.length === 0) {
      return {
        status: "empty",
        kind: "no_questions",
        moduleTitle: mod.title,
        moduleId,
      };
    }

    return {
      status: "ok",
      data: {
        moduleId,
        moduleTitle: mod.title,
        moduleOrderNumber: mod.orderNumber,
        tests: testsPayload,
        nextStep: learning.neighbors.next,
        modulePathSteps,
        learning: pageLearning,
        aiMentorConfigured: isAiConfigured(),
      },
    };
  } catch (error) {
    logError("test_page_load_failed", {
      userId,
      moduleId,
      code: safeErrorCode(error),
    });
    return { status: "error", kind: "load" };
  }
}
