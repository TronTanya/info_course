import type { Metadata } from "next";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { DashboardClientExtras } from "@/components/layout/dashboard-client-extras";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  DashboardEmptyState,
  DashboardPageLoadError,
  DashboardUnauthorizedState,
} from "@/components/dashboard/dashboard-page-states";
import { auth } from "@/lib/auth";
import { buildDashboardHomeMetadata } from "@/lib/dashboard-metadata";
import { loadDashboardPageData } from "@/lib/dashboard-page-load";

export const metadata: Metadata = buildDashboardHomeMetadata();

export default async function DashboardHomePage() {
  const session = await auth();
  const result = await loadDashboardPageData(session?.user?.id, session);

  if (result.status === "unauthorized") {
    return (
      <DashboardShell>
        <DashboardUnauthorizedState />
      </DashboardShell>
    );
  }

  if (result.status === "empty") {
    return (
      <DashboardShell>
        <DashboardEmptyState kind="course_unavailable" />
      </DashboardShell>
    );
  }

  if (result.status === "error") {
    return (
      <DashboardShell>
        <DashboardPageLoadError kind={result.kind} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHome
        stats={result.stats}
        displayName={result.displayName}
        achievements={result.achievements}
        modules={result.modules}
        aiMentorConfigured={result.aiMentorConfigured}
      />
      <DashboardClientExtras achievementUnlocks={result.achievementUnlocks} />
    </DashboardShell>
  );
}
