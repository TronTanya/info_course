"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardAchievementsPreview } from "@/components/dashboard/dashboard-achievements-preview";
import { DashboardCertificateProgress } from "@/components/dashboard/dashboard-certificate-progress";
import { DashboardContinueLearning } from "@/components/dashboard/dashboard-continue-learning";
import { DashboardEmpty } from "@/components/dashboard/dashboard-empty";
import { DashboardProgressOverview } from "@/components/dashboard/dashboard-progress-overview";
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";
import { DashboardRoadmap } from "@/components/dashboard/dashboard-roadmap";
import { DashboardUpcomingTasks } from "@/components/dashboard/dashboard-upcoming-tasks";
import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";
import type { AchievementRow } from "@/lib/achievements";
import {
  buildRecentActivities,
  buildUpcomingTasks,
} from "@/lib/dashboard-ui";
import { motionPresets } from "@/lib/design-system/motion";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { cn } from "@/lib/utils";

const SECONDARY_LINKS = [
  { href: "/dashboard/course", label: "Карта курса" },
  { href: "/dashboard/profile", label: "Профиль" },
  { href: "/dashboard/my-assignments", label: "Задания" },
  { href: "/dashboard/certificate", label: "Сертификат" },
  { href: "/dashboard/settings", label: "Настройки" },
] as const;

export function DashboardHome({
  stats,
  displayName,
  achievements,
  modules,
}: {
  stats: ProfileCourseStats | null;
  displayName: string;
  achievements: AchievementRow[];
  modules: CourseProgressModuleRow[];
}) {
  if (!stats) {
    return (
      <motion.div className="space-y-8" {...motionPresets.fadeIn}>
        <DashboardEmpty />
      </motion.div>
    );
  }

  const recent = buildRecentActivities(stats);
  const upcoming = buildUpcomingTasks(modules);
  const achievementsUnlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <motion.div
      className="space-y-10 overflow-x-hidden pb-4"
      {...motionPresets.fadeIn}
    >
      <DashboardWelcome displayName={displayName} stats={stats} modules={modules} />

      <DashboardContinueLearning stats={stats} modules={modules} />

      <DashboardProgressOverview
        stats={stats}
        modules={modules}
        achievementsUnlocked={achievementsUnlocked}
        achievementsTotal={achievements.length}
      />

      {modules.length > 0 ? (
        <DashboardRoadmap modules={modules} currentModuleId={stats.currentModuleId} />
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <DashboardRecentActivity items={recent} />
        <DashboardUpcomingTasks tasks={upcoming} />
      </div>

      <DashboardCertificateProgress stats={stats} />

      {achievements.length > 0 ? <DashboardAchievementsPreview rows={achievements} /> : null}

      <nav
        className="ce-glass flex flex-wrap justify-center gap-x-4 gap-y-2 rounded-2xl border border-border/60 px-4 py-3 sm:justify-start"
        aria-label="Разделы кабинета"
      >
        {SECONDARY_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}
