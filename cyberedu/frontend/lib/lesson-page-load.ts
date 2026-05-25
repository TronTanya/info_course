import type { LearningPageContext } from "@/lib/learning-context";
import { buildLearningPageContext } from "@/lib/learning-context";
import {
  checkModuleAccessForApi,
  checkPracticeEntry,
  checkTestPrerequisites,
} from "@/lib/course-progress-guards";
import { getLockedUnlockHint } from "@/lib/course-ui-status";
import { getLessonAiSnapshots, getLessonForModulePage } from "@/lib/lesson-ai-service";
import { isLessonContentEmpty } from "@/lib/lesson-page-state";
import { buildLessonViewModel } from "@/lib/lesson-view-mapper";
import { logError } from "@/lib/log/structured";
import { prisma } from "@/lib/db";
import { isAiConfigured } from "@/lib/ai-config";
import {
  getDefaultCourseForDashboard,
  getModuleProgress,
  syncAndGetUserCourseProgress,
} from "@/lib/progress";
import type { LessonViewModel } from "@/types/lesson-view-model";

export type LessonPageLoadErrorKind = "lesson" | "progress" | "access";

export type LessonPageEmptyKind = "module_not_found" | "lesson_not_found" | "content_empty";

export type LessonAiSnapshotSerialized = {
  id: string;
  adaptedContent: string;
  interestsUsed: string;
  createdAt: string;
} | null;

export type LessonPageOkPayload = {
  moduleId: string;
  moduleProgressPercent: number;
  moduleStepsLabel: string;
  learning: LearningPageContext;
  view: LessonViewModel;
  videoUrl: string | null;
  allowAiAdaptation: boolean;
  mentorAiConfigured: boolean;
  explanationAdaptation: LessonAiSnapshotSerialized;
  summaryAdaptation: LessonAiSnapshotSerialized;
};

export type LessonPageLoadResult =
  | { status: "unauthorized" }
  | {
      status: "empty";
      kind: LessonPageEmptyKind;
      moduleTitle?: string;
      lessonTitle?: string;
    }
  | { status: "locked"; reason: string; moduleTitle?: string }
  | { status: "error"; kind: LessonPageLoadErrorKind }
  | { status: "ok"; data: LessonPageOkPayload };

function safeErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 120);
  }
  return undefined;
}

function moduleStepsLabel(
  req: {
    lessonRequired: boolean;
    videoRequired: boolean;
    testRequired: boolean;
    practiceRequired: boolean;
    totalSteps: number;
  },
  p: {
    lessonCompleted: boolean;
    videoCompleted: boolean;
    testCompleted: boolean;
    practiceCompleted: boolean;
  } | null | undefined,
): string {
  let d = 0;
  if (req.lessonRequired && p?.lessonCompleted) d++;
  if (req.videoRequired && p?.videoCompleted) d++;
  if (req.testRequired && p?.testCompleted) d++;
  if (req.practiceRequired && p?.practiceCompleted) d++;
  const t = req.totalSteps;
  return t ? `${d} из ${t}` : "—";
}

function serializeSnapshot(
  row: { id: string; adaptedContent: string; interestsUsed: string; createdAt: Date } | null,
): LessonAiSnapshotSerialized {
  if (!row) return null;
  return {
    id: row.id,
    adaptedContent: row.adaptedContent,
    interestsUsed: row.interestsUsed,
    createdAt: row.createdAt.toISOString(),
  };
}

async function resolveLockedReason(userId: string, moduleId: string, fallback: string): Promise<string> {
  try {
    const course = await getDefaultCourseForDashboard();
    if (!course) return fallback;
    const data = await syncAndGetUserCourseProgress(userId, course.id);
    if (!data) return fallback;
    const row = data.modules.find((m) => m.module.id === moduleId);
    if (row) return getLockedUnlockHint(row, data.modules);
  } catch (error) {
    logError("lesson_page_locked_hint_failed", {
      userId,
      moduleId,
      code: safeErrorCode(error),
    });
  }
  return fallback;
}

/**
 * Загрузка страницы урока: без redirect, без stack trace в UI, с безопасным логированием.
 */
export async function loadLessonPageData(
  userId: string | undefined,
  moduleId: string,
): Promise<LessonPageLoadResult> {
  if (!userId) {
    return { status: "unauthorized" };
  }

  let mod: { id: string; title: string; orderNumber: number; isActive: boolean } | null;
  try {
    mod = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { id: true, title: true, orderNumber: true, isActive: true },
    });
  } catch (error) {
    logError("lesson_page_module_lookup_failed", {
      userId,
      moduleId,
      code: safeErrorCode(error),
    });
    return { status: "error", kind: "access" };
  }

  if (!mod?.isActive) {
    return { status: "empty", kind: "module_not_found" };
  }

  const access = await checkModuleAccessForApi(userId, moduleId);
  if (!access.ok) {
    if (access.code === "MODULE_LOCKED") {
      const reason = await resolveLockedReason(userId, moduleId, access.message);
      return { status: "locked", reason, moduleTitle: mod.title };
    }
    logError("lesson_page_access_denied", {
      userId,
      moduleId,
      code: access.code,
    });
    return { status: "error", kind: "access" };
  }

  let lesson: Awaited<ReturnType<typeof getLessonForModulePage>>;
  try {
    lesson = await getLessonForModulePage(moduleId);
  } catch (error) {
    logError("lesson_page_lesson_load_failed", {
      userId,
      moduleId,
      code: safeErrorCode(error),
    });
    return { status: "error", kind: "lesson" };
  }

  if (!lesson) {
    return { status: "empty", kind: "lesson_not_found" };
  }

  if (isLessonContentEmpty(lesson.content)) {
    return {
      status: "empty",
      kind: "content_empty",
      moduleTitle: mod.title,
      lessonTitle: lesson.title,
    };
  }

  try {
    const [progress, mp, aiSnaps, testGate, practiceGate, lessonsInModule] = await Promise.all([
      prisma.progress.findUnique({
        where: { userId_moduleId: { userId, moduleId } },
        select: { lessonCompleted: true },
      }),
      getModuleProgress(userId, moduleId),
      getLessonAiSnapshots(userId, lesson.id),
      checkTestPrerequisites(userId, moduleId),
      checkPracticeEntry(userId, moduleId),
      prisma.lesson.findMany({
        where: { moduleId },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      }),
    ]);

    if (!mp) {
      logError("lesson_page_progress_empty", { userId, moduleId });
      return { status: "error", kind: "progress" };
    }

    const lessonOrderInModule = Math.max(
      1,
      lessonsInModule.findIndex((l) => l.id === lesson.id) + 1,
    );

    const lessonCompleted = Boolean(progress?.lessonCompleted);
    const steps = moduleStepsLabel(mp.requirements, mp.progress);

    const learning = await buildLearningPageContext(
      userId,
      moduleId,
      `/dashboard/course/${moduleId}/lesson`,
      mp.requirements,
      mp.progress,
    );

    const view = buildLessonViewModel({
      moduleId,
      lesson: { id: lesson.id, title: lesson.title, content: lesson.content },
      hasVideo: Boolean(lesson.videoUrl),
      moduleTitle: mod.title,
      moduleOrderNumber: mod.orderNumber,
      lessonOrderInModule,
      moduleUnlocked: true,
      lessonCompleted,
      hasProgressRow: progress !== null,
      learning,
      access: {
        canMarkComplete: !lessonCompleted,
        canAccessTest: testGate.ok,
        canAccessPractice: practiceGate.ok,
      },
    });

    return {
      status: "ok",
      data: {
        moduleId,
        moduleProgressPercent: mp.progressPercent,
        moduleStepsLabel: steps,
        learning,
        view,
        videoUrl: lesson.videoUrl,
        allowAiAdaptation: lesson.allowAiAdaptation,
        mentorAiConfigured: isAiConfigured(),
        explanationAdaptation: serializeSnapshot(aiSnaps.explanation),
        summaryAdaptation: serializeSnapshot(aiSnaps.summary),
      },
    };
  } catch (error) {
    logError("lesson_page_progress_load_failed", {
      userId,
      moduleId,
      code: safeErrorCode(error),
    });
    return { status: "error", kind: "progress" };
  }
}
