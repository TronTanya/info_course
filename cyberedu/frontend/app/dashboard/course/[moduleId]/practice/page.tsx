import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { assertModuleAccess, checkPracticeEntry } from "@/lib/course-progress-guards";
import { getModuleRequirements, moduleStepProgress, recalculateModuleProgress } from "@/lib/progress";
import { requireAuth } from "@/lib/permissions";
import { PracticePageClient } from "@/components/practice/practice-page-client";
import {
  allowedTypesHuman,
  fileInputAcceptFromExts,
  practiceUploadLimitsFromTask,
} from "@/lib/practice-file-constants";
import { DashboardShell } from "@/components/layout/dashboard-shell";

type Props = { params: Promise<{ moduleId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId } = await params;
  const m = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { title: true, isActive: true },
  });
  if (!m?.isActive) return { title: "Практика" };
  return { title: `Практика · ${m.title}` };
}

export default async function PracticePage({ params }: Props) {
  const session = await requireAuth();
  const { moduleId } = await params;
  await assertModuleAccess(session.user.id, moduleId);

  await recalculateModuleProgress(session.user.id, moduleId);

  const userId = session.user.id;

  const practiceGate = await checkPracticeEntry(userId, moduleId);

  const [moduleFull, tasks] = await Promise.all([
    prisma.module.findUnique({
      where: { id: moduleId },
      select: {
        id: true,
        courseId: true,
        isActive: true,
        title: true,
        orderNumber: true,
        lessons: { select: { videoUrl: true } },
        tests: { select: { id: true } },
        practicalTasks: { select: { id: true } },
        course: { select: { title: true } },
      },
    }),
    prisma.practicalTask.findMany({
      where: { moduleId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const progress = await prisma.progress.findUnique({
    where: { userId_moduleId: { userId, moduleId } },
  });

  const requirements = moduleFull ? getModuleRequirements(moduleFull) : null;
  const moduleProgress = requirements ? moduleStepProgress(requirements, progress) : { percent: 0, completed: 0, total: 0 };

  const taskIds = tasks.map((t) => t.id);
  const isConsoleTask = (t: (typeof tasks)[number]) => t.taskType === "INTERACTIVE" || t.taskType === "TRAINING_CONSOLE";
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

  const clientTasks = tasks.map((t) => {
    const ls = latestByTask.get(t.id);
    const ec = t.expectedCommand?.trim() || null;
    const ep = t.expectedAnswerPattern?.trim() || null;
    const legacy = t.interactiveExpectedAnswer?.trim() || null;
    const interactiveMode: "structured" | "legacy" | "manual" =
      isConsoleTask(t) ? (ec || ep ? "structured" : legacy ? "legacy" : "manual") : "manual";

    const fileLimits =
      t.taskType === "FILE_UPLOAD" || t.taskType === "COMBINED"
        ? practiceUploadLimitsFromTask({
            allowedFileTypes: t.allowedFileTypes,
            maxFileSizeMb: t.maxFileSizeMb,
          })
        : null;

    return {
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
      hasInteractiveAutoCheck: Boolean(
        isConsoleTask(t) && (legacy || ec || ep),
      ),
      interactiveMode,
      expectedCommand: isConsoleTask(t) ? ec : null,
      expectedAnswerPattern: isConsoleTask(t) ? ep : null,
      scenarioData: t.scenarioData ?? null,
      latestSubmission: ls
        ? {
            id: ls.id,
            status: ls.status,
            textAnswer: ls.textAnswer,
            fileDownloadUrl: ls.fileUrl?.startsWith("/api/") ? ls.fileUrl : null,
            score: ls.score,
            adminComment: ls.adminComment,
            createdAt: ls.createdAt.toISOString(),
          }
        : null,
    };
  });

  return (
    <DashboardShell wide>
      <PracticePageClient
        moduleId={moduleId}
        moduleTitle={moduleFull?.title ?? "Модуль"}
        labContext={{
          courseTitle: moduleFull?.course.title ?? "Курс",
          moduleOrderNumber: moduleFull?.orderNumber ?? 0,
          moduleTitle: moduleFull?.title ?? "Модуль",
          moduleProgress,
        }}
        practiceGate={practiceGate}
        tasks={clientTasks}
      />
    </DashboardShell>
  );
}
