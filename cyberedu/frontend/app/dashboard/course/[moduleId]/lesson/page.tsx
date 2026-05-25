import type { Metadata } from "next";
import { LessonPageClient } from "@/components/lesson/lesson-page-client";
import {
  LessonLockedState,
  LessonPageEmptyState,
  LessonPageLoadError,
  LessonUnauthorizedState,
} from "@/components/lesson/lesson-page-states";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { auth } from "@/lib/auth";
import { checkModuleAccessForApi } from "@/lib/course-progress-guards";
import { loadLessonPageData } from "@/lib/lesson-page-load";
import { buildLessonPageMetadata } from "@/lib/lesson-page-metadata";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ moduleId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return buildLessonPageMetadata({ moduleActive: false });
  }

  const access = await checkModuleAccessForApi(session.user.id, moduleId);
  if (!access.ok) {
    return buildLessonPageMetadata({ moduleActive: false });
  }

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { isActive: true },
  });

  if (!mod?.isActive) {
    return buildLessonPageMetadata({ moduleActive: false });
  }

  const lesson = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { createdAt: "asc" },
    select: { title: true, content: true },
  });

  return buildLessonPageMetadata({
    moduleActive: true,
    canExposeLessonDetails: true,
    lessonTitle: lesson?.title ?? null,
    lessonContent: lesson?.content ?? null,
  });
}

export default async function LessonPage({ params }: Props) {
  const session = await auth();
  const { moduleId } = await params;
  const result = await loadLessonPageData(session?.user?.id, moduleId);

  if (result.status === "unauthorized") {
    return (
      <DashboardShell wide>
        <LessonUnauthorizedState />
      </DashboardShell>
    );
  }

  if (result.status === "locked") {
    return (
      <DashboardShell wide>
        <LessonLockedState reason={result.reason} moduleTitle={result.moduleTitle} />
      </DashboardShell>
    );
  }

  if (result.status === "empty") {
    return (
      <DashboardShell wide>
        <LessonPageEmptyState
          kind={result.kind}
          moduleTitle={result.moduleTitle}
          lessonTitle={result.lessonTitle}
        />
      </DashboardShell>
    );
  }

  if (result.status === "error") {
    return (
      <DashboardShell wide>
        <LessonPageLoadError kind={result.kind} />
      </DashboardShell>
    );
  }

  const { data } = result;

  return (
    <DashboardShell wide>
      <LessonPageClient
        moduleId={data.moduleId}
        moduleProgressPercent={data.moduleProgressPercent}
        moduleStepsLabel={data.moduleStepsLabel}
        learning={data.learning}
        view={data.view}
        videoUrl={data.videoUrl}
        allowAiAdaptation={data.allowAiAdaptation}
        mentorAiConfigured={data.mentorAiConfigured}
        explanationAdaptation={data.explanationAdaptation}
        summaryAdaptation={data.summaryAdaptation}
      />
    </DashboardShell>
  );
}
