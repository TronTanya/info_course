import type { ProgressGate } from "@/lib/course-progress-guards";
import { checkPracticeEntry } from "@/lib/course-progress-guards";
import { getCertificateDashboardState } from "@/lib/certificate";
import { buildCoursePageCertificateSummary } from "@/lib/course-page-summary";
import { computeStepMetrics } from "@/lib/dashboard-ui";
import { buildLearningPageContext } from "@/lib/learning-context";
import { getModuleRequirements, moduleStepProgress } from "@/lib/progress";
import { getDefaultCourseForDashboard, syncAndGetUserCourseProgress } from "@/lib/progress";
import { isAiConfigured } from "@/lib/ai-config";
import { logError } from "@/lib/log/structured";
import {
  resolvePracticeLockedReason,
  type PracticePageEmptyKind,
  type PracticePageLoadErrorKind,
} from "@/lib/practice-page-state";
import { sanitizeScenarioDataForStudent } from "@/lib/practice-student-scenario";
import type { PracticePageLearningContext } from "@/lib/practice-next-learning-step";
import { buildPracticeViewModel } from "@/lib/practice-view-mapper";
import type {
  ClientSubmission,
  PracticeLabModuleContext,
  PracticePageTask,
  PracticeTaskRuntime,
} from "@/lib/practice-page-types";
import { prisma } from "@/lib/db";
import {
  allowedTypesHuman,
  fileInputAcceptFromExts,
  practiceUploadLimitsFromTask,
} from "@/lib/practice-file-constants";
import type { PracticalTaskType } from "@prisma/client";
import type { ModuleForProgress } from "@/lib/progress";

/** Модуль с полями, нужными для прогресса и labContext. */
export type PracticeModuleForLoad = ModuleForProgress & {
  title: string;
  course: { title: string };
};

const PRACTICE_MODULE_SELECT = {
  id: true,
  courseId: true,
  isActive: true,
  title: true,
  orderNumber: true,
  lessons: { select: { videoUrl: true } },
  tests: { select: { id: true } },
  practicalTasks: { select: { id: true } },
  course: { select: { title: true } },
} as const;

export type PracticePageOkPayload = {
  moduleId: string;
  moduleTitle: string;
  labContext: PracticeLabModuleContext;
  tasks: PracticePageTask[];
  learning: PracticePageLearningContext;
  aiMentorConfigured: boolean;
};

export type PracticePageLoadResult =
  | { status: "unauthorized" }
  | { status: "empty"; kind: PracticePageEmptyKind; moduleTitle?: string }
  | { status: "locked"; code: string; reason: string; moduleId: string; moduleTitle?: string }
  | { status: "error"; kind: PracticePageLoadErrorKind }
  | { status: "ok"; data: PracticePageOkPayload };

function isConsoleTask(t: { taskType: PracticalTaskType }): boolean {
  return t.taskType === "INTERACTIVE" || t.taskType === "TRAINING_CONSOLE";
}

function safeErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 120);
  }
  return undefined;
}

async function buildPracticePageOkPayload(
  userId: string,
  moduleId: string,
  moduleFull: PracticeModuleForLoad,
  tasks: Awaited<ReturnType<typeof prisma.practicalTask.findMany>>,
): Promise<PracticePageOkPayload> {
  const progress = await prisma.progress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  const requirements = getModuleRequirements(moduleFull);
  const moduleProgress = moduleStepProgress(requirements, progress);

  const taskIds = tasks.map((t) => t.id);
  const submissions =
    taskIds.length > 0
      ? await prisma.submission.findMany({
          where: { userId, practicalTaskId: { in: taskIds }, status: { not: "DRAFT" } },
          orderBy: { createdAt: "desc" },
        })
      : [];

  const latestByTask = new Map<string, (typeof submissions)[number]>();
  for (const s of submissions) {
    if (!latestByTask.has(s.practicalTaskId)) latestByTask.set(s.practicalTaskId, s);
  }

  const attemptRows =
    taskIds.length > 0
      ? await prisma.submission.groupBy({
          by: ["practicalTaskId"],
          where: { userId, practicalTaskId: { in: taskIds }, status: { not: "DRAFT" } },
          _count: { _all: true },
        })
      : [];
  const attemptByTask = new Map(attemptRows.map((r) => [r.practicalTaskId, r._count._all]));

  const mp = progress ? { requirements, progress } : null;
  const learningNav = mp
    ? await buildLearningPageContext(
        userId,
        moduleId,
        `/dashboard/course/${moduleId}/practice`,
        mp.requirements,
        mp.progress,
      )
    : null;

  const course = await getDefaultCourseForDashboard();
  const courseProgress = course ? await syncAndGetUserCourseProgress(userId, course.id) : null;
  const courseModules = courseProgress?.modules ?? [];
  const metrics = computeStepMetrics(courseModules);
  let certificate = buildCoursePageCertificateSummary(courseModules, metrics, null);
  try {
    const certState = await getCertificateDashboardState(userId);
    certificate = buildCoursePageCertificateSummary(courseModules, metrics, certState);
  } catch {
    /* certificate optional */
  }

  const currentRow = courseModules.find((m) => m.module.id === moduleId);
  const allModulesComplete =
    courseModules.length > 0 && courseModules.every((m) => m.moduleCompleted);

  const learning: PracticePageLearningContext = {
    moduleId,
    moduleTitle: moduleFull.title,
    courseTitle: moduleFull.course.title,
    courseHref: "/dashboard/course",
    lessonHref: `/dashboard/course/${moduleId}/lesson`,
    testHref: `/dashboard/course/${moduleId}/test`,
    moduleHref: `/dashboard/course/${moduleId}`,
    moduleCompleted: Boolean(currentRow?.moduleCompleted ?? progress?.moduleCompleted),
    practiceCompleted: Boolean(currentRow?.moduleCompleted ?? progress?.practiceCompleted),
    allModulesComplete,
    courseModules: learningNav?.modules ?? [],
    certificate,
  };

  const practiceCompleted = Boolean(progress?.practiceCompleted);
  const practiceGate: ProgressGate = { ok: true };

  const clientTasks: PracticePageTask[] = tasks.map((t) => {
    const ls = latestByTask.get(t.id);
    const ec = t.expectedCommand?.trim() || null;
    const ep = t.expectedAnswerPattern?.trim() || null;
    const legacy = t.interactiveExpectedAnswer?.trim() || null;
    const interactiveMode: "structured" | "legacy" | "manual" = isConsoleTask(t)
      ? ec || ep
        ? "structured"
        : legacy
          ? "legacy"
          : "manual"
      : "manual";

    const fileLimits =
      t.taskType === "FILE_UPLOAD" || t.taskType === "COMBINED"
        ? practiceUploadLimitsFromTask({
            allowedFileTypes: t.allowedFileTypes,
            maxFileSizeMb: t.maxFileSizeMb,
          })
        : null;

    const latestSubmission: ClientSubmission = ls
      ? {
          id: ls.id,
          status: ls.status,
          textAnswer: ls.textAnswer,
          fileDownloadUrl: ls.fileUrl?.startsWith("/api/") ? ls.fileUrl : null,
          score: ls.score,
          adminComment: ls.adminComment,
          createdAt: ls.createdAt.toISOString(),
        }
      : null;

    const runtime: PracticeTaskRuntime = {
      id: t.id,
      title: t.title,
      description: t.description,
      taskType: t.taskType,
      checkType: t.checkType,
      maxScore: t.maxScore,
      minLength: t.minLength,
      instruction: t.instruction,
      consoleScenario: isConsoleTask(t) ? t.consoleScenario : null,
      fileAccept: fileLimits ? fileInputAcceptFromExts(fileLimits.allowedExts) : null,
      fileTypesLabel: fileLimits ? allowedTypesHuman(fileLimits.allowedExts) : null,
      fileMaxMb: fileLimits ? Math.round(fileLimits.maxBytes / (1024 * 1024)) : null,
      hasInteractiveAutoCheck: Boolean(isConsoleTask(t) && (legacy || ec || ep)),
      hasStructuredCommandStep: Boolean(isConsoleTask(t) && ec),
      hasStructuredExplanationStep: Boolean(isConsoleTask(t) && ep),
      interactiveMode,
      scenarioData: sanitizeScenarioDataForStudent(t.scenarioData),
      latestSubmission,
      attemptCount: attemptByTask.get(t.id) ?? 0,
    };

    const view = buildPracticeViewModel({
      task: {
        id: runtime.id,
        title: runtime.title,
        description: runtime.description,
        taskType: runtime.taskType,
        checkType: runtime.checkType,
        maxScore: runtime.maxScore,
        minLength: runtime.minLength,
        instruction: runtime.instruction,
        consoleScenario: runtime.consoleScenario,
        scenarioData: runtime.scenarioData,
        hasInteractiveAutoCheck: runtime.hasInteractiveAutoCheck,
        hasStructuredCommandStep: runtime.hasStructuredCommandStep,
        hasStructuredExplanationStep: runtime.hasStructuredExplanationStep,
        fileTypesLabel: runtime.fileTypesLabel,
        fileMaxMb: runtime.fileMaxMb,
      },
      moduleId,
      moduleTitle: moduleFull.title,
      moduleOrderNumber: moduleFull.orderNumber,
      practiceGate,
      latestSubmission: latestSubmission
        ? {
            id: latestSubmission.id,
            status: latestSubmission.status,
            score: latestSubmission.score,
            adminComment: latestSubmission.adminComment,
            createdAt: latestSubmission.createdAt,
            fileDownloadUrl: latestSubmission.fileDownloadUrl,
          }
        : null,
      practiceCompleted,
      learning,
    });

    return { view, runtime };
  });

  return {
    moduleId,
    moduleTitle: moduleFull.title,
    labContext: {
      courseTitle: moduleFull.course.title,
      moduleOrderNumber: moduleFull.orderNumber,
      moduleTitle: moduleFull.title,
      moduleProgress,
    },
    tasks: clientTasks,
    learning,
    aiMentorConfigured: isAiConfigured(),
  };
}

/**
 * Загрузка страницы практики: без redirect, без stack trace в UI, с безопасным логированием.
 */
export async function loadPracticePageData(
  userId: string | undefined,
  moduleId: string,
): Promise<PracticePageLoadResult> {
  if (!userId) {
    return { status: "unauthorized" };
  }

  let practiceGate: ProgressGate;
  try {
    practiceGate = await checkPracticeEntry(userId, moduleId);
  } catch (error) {
    logError("practice_page_gate_failed", {
      userId,
      moduleId,
      code: safeErrorCode(error),
    });
    return { status: "error", kind: "access" };
  }

  if (!practiceGate.ok) {
    try {
      const m = await prisma.module.findUnique({
        where: { id: moduleId },
        select: { title: true, isActive: true },
      });
      if (!m?.isActive) {
        return { status: "empty", kind: "module_not_found" };
      }
      return {
        status: "locked",
        code: practiceGate.code,
        reason: resolvePracticeLockedReason(practiceGate.code, practiceGate.message),
        moduleId,
        moduleTitle: m.title,
      };
    } catch (error) {
      logError("practice_page_locked_lookup_failed", {
        userId,
        moduleId,
        code: safeErrorCode(error),
      });
      return { status: "error", kind: "load" };
    }
  }

  let moduleFull: PracticeModuleForLoad | null;
  let tasks: Awaited<ReturnType<typeof prisma.practicalTask.findMany>>;
  try {
    [moduleFull, tasks] = await Promise.all([
      prisma.module.findUnique({
        where: { id: moduleId },
        select: PRACTICE_MODULE_SELECT,
      }) as Promise<PracticeModuleForLoad | null>,
      prisma.practicalTask.findMany({
        where: { moduleId },
        orderBy: { createdAt: "asc" },
      }),
    ]);
  } catch (error) {
    logError("practice_page_module_tasks_failed", {
      userId,
      moduleId,
      code: safeErrorCode(error),
    });
    return { status: "error", kind: "load" };
  }

  if (!moduleFull?.isActive) {
    return { status: "empty", kind: "module_not_found" };
  }

  if (tasks.length === 0) {
    return {
      status: "empty",
      kind: "practice_not_found",
      moduleTitle: moduleFull.title,
    };
  }

  try {
    const data = await buildPracticePageOkPayload(userId, moduleId, moduleFull, tasks);
    return { status: "ok", data };
  } catch (error) {
    logError("practice_page_payload_failed", {
      userId,
      moduleId,
      code: safeErrorCode(error),
    });
    return { status: "error", kind: "progress" };
  }
}
