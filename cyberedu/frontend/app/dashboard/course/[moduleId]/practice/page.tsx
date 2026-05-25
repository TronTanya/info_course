import type { Metadata } from "next";
import { loadPracticePageData } from "@/lib/practice-page-load";
import { auth } from "@/lib/auth";
import { recalculateModuleProgress } from "@/lib/progress";
import { PracticePageClient } from "@/components/practice/practice-page-client";
import {
  PracticeLockedState,
  PracticePageEmptyState,
  PracticePageLoadError,
  PracticeUnauthorizedState,
} from "@/components/practice/practice-page-states";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buildPracticePageMetadata } from "@/lib/practice-page-metadata";

type Props = { params: Promise<{ moduleId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId } = await params;
  const session = await auth();
  return buildPracticePageMetadata(moduleId, session?.user?.id);
}

export default async function PracticePage({ params }: Props) {
  const session = await auth();
  const { moduleId } = await params;

  if (session?.user?.id) {
    await recalculateModuleProgress(session.user.id, moduleId);
  }

  const result = await loadPracticePageData(session?.user?.id, moduleId);

  if (result.status === "unauthorized") {
    return (
      <DashboardShell wide>
        <PracticeUnauthorizedState />
      </DashboardShell>
    );
  }

  if (result.status === "locked") {
    return (
      <DashboardShell wide>
        <PracticeLockedState
          code={result.code}
          reason={result.reason}
          moduleId={result.moduleId}
          moduleTitle={result.moduleTitle}
        />
      </DashboardShell>
    );
  }

  if (result.status === "empty") {
    return (
      <DashboardShell wide>
        <PracticePageEmptyState
          kind={result.kind}
          moduleId={moduleId}
          moduleTitle={result.moduleTitle}
        />
      </DashboardShell>
    );
  }

  if (result.status === "error") {
    return (
      <DashboardShell wide>
        <PracticePageLoadError kind={result.kind} />
      </DashboardShell>
    );
  }

  const { data } = result;

  return (
    <DashboardShell wide>
      <PracticePageClient
        moduleId={data.moduleId}
        moduleTitle={data.moduleTitle}
        labContext={data.labContext}
        tasks={data.tasks}
        aiMentorConfigured={data.aiMentorConfigured}
      />
    </DashboardShell>
  );
}
