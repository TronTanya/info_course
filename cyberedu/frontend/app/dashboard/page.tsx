import type { Metadata } from "next";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { DashboardClientExtras } from "@/components/layout/dashboard-client-extras";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { achievementNoticesFromKinds, getUserAchievementRows, reconcileUserAchievements } from "@/lib/achievements";
import { getProfileCourseStats } from "@/lib/profile-course-stats";
import { requireAuth } from "@/lib/permissions";
import { syncAndGetUserCourseProgress } from "@/lib/progress";

export const metadata: Metadata = {
  title: "Кабинет",
};

export default async function DashboardHomePage() {
  const session = await requireAuth();
  const [stats, newUnlocks] = await Promise.all([
    getProfileCourseStats(session.user.id),
    reconcileUserAchievements(session.user.id),
  ]);
  const progress =
    stats?.courseId != null
      ? await syncAndGetUserCourseProgress(session.user.id, stats.courseId)
      : null;
  const modules = progress?.modules ?? [];
  const achievements = await getUserAchievementRows(session.user.id);
  const displayName = session.user.name?.trim() || session.user.email?.split("@")[0] || "студент";
  const achievementUnlocks = achievementNoticesFromKinds(newUnlocks);

  return (
    <DashboardShell>
      <DashboardHome
        stats={stats}
        displayName={displayName}
        achievements={achievements}
        modules={modules}
      />
      <DashboardClientExtras achievementUnlocks={achievementUnlocks} />
    </DashboardShell>
  );
}
