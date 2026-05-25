import type { Metadata } from "next";
import { MentorStandalonePageClient } from "@/components/mentor/mentor-standalone-page-client";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getProfileCourseStats } from "@/lib/profile-course-stats";
import { requireAuth } from "@/lib/permissions";
import { isAiConfigured } from "@/lib/ai-config";
import { syncAndGetUserCourseProgress } from "@/lib/progress";

export const metadata: Metadata = {
  title: "AI-наставник",
  robots: { index: false, follow: false },
};

export default async function DashboardMentorPage() {
  const session = await requireAuth();
  const stats = await getProfileCourseStats(session.user.id);
  const progress =
    stats?.courseId != null
      ? await syncAndGetUserCourseProgress(session.user.id, stats.courseId)
      : null;
  const modules = progress?.modules ?? [];

  return (
    <DashboardShell stack="tight">
      <MentorStandalonePageClient
        stats={stats}
        modules={modules}
        aiMentorConfigured={isAiConfigured()}
      />
    </DashboardShell>
  );
}
