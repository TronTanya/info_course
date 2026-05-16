import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonPageClient } from "@/components/lesson/lesson-page-client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { prisma } from "@/lib/db";
import { getLessonAiSnapshots, getLessonForModulePage } from "@/lib/lesson-ai-service";
import { assertModuleAccess } from "@/lib/course-progress-guards";
import { getModuleProgress, recalculateModuleProgress } from "@/lib/progress";
import { requireAuth } from "@/lib/permissions";

type Props = { params: Promise<{ moduleId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId } = await params;
  const [mod, lesson] = await Promise.all([
    prisma.module.findUnique({ where: { id: moduleId }, select: { title: true, isActive: true } }),
    prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { createdAt: "asc" },
      select: { title: true },
    }),
  ]);
  if (!mod?.isActive) return { title: "Лекция" };
  if (lesson) return { title: `Лекция · ${lesson.title}` };
  return { title: `Лекция · ${mod.title}` };
}

function moduleStepsLabel(
  req: { lessonRequired: boolean; videoRequired: boolean; testRequired: boolean; practiceRequired: boolean; totalSteps: number },
  p: { lessonCompleted: boolean; videoCompleted: boolean; testCompleted: boolean; practiceCompleted: boolean } | null | undefined,
): string {
  const row = p;
  let d = 0;
  if (req.lessonRequired && row?.lessonCompleted) d++;
  if (req.videoRequired && row?.videoCompleted) d++;
  if (req.testRequired && row?.testCompleted) d++;
  if (req.practiceRequired && row?.practiceCompleted) d++;
  const t = req.totalSteps;
  return t ? `${d} из ${t}` : "—";
}

function serializeSnapshot(row: { id: string; adaptedContent: string; interestsUsed: string; createdAt: Date } | null) {
  if (!row) return null;
  return {
    id: row.id,
    adaptedContent: row.adaptedContent,
    interestsUsed: row.interestsUsed,
    createdAt: row.createdAt.toISOString(),
  };
}

export default async function LessonPage({ params }: Props) {
  const session = await requireAuth();
  const { moduleId } = await params;
  await assertModuleAccess(session.user.id, moduleId);

  const lesson = await getLessonForModulePage(moduleId);
  if (!lesson) notFound();

  await recalculateModuleProgress(session.user.id, moduleId);

  const [progress, mp, mod, aiSnaps] = await Promise.all([
    prisma.progress.findUnique({
      where: { userId_moduleId: { userId: session.user.id, moduleId } },
      select: { lessonCompleted: true },
    }),
    getModuleProgress(session.user.id, moduleId),
    prisma.module.findUnique({
      where: { id: moduleId },
      select: { title: true },
    }),
    getLessonAiSnapshots(session.user.id, lesson.id),
  ]);

  if (!mp) notFound();

  const moduleSteps = moduleStepsLabel(mp.requirements, mp.progress);

  return (
    <DashboardShell>
      <LessonPageClient
        moduleId={moduleId}
        moduleTitle={mod?.title ?? "Модуль"}
        moduleProgressPercent={mp.progressPercent}
        moduleStepsLabel={moduleSteps}
        lesson={{
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          allowAiAdaptation: lesson.allowAiAdaptation,
        }}
        lessonCompleted={Boolean(progress?.lessonCompleted)}
        explanationAdaptation={serializeSnapshot(aiSnaps.explanation)}
        summaryAdaptation={serializeSnapshot(aiSnaps.summary)}
      />
    </DashboardShell>
  );
}
