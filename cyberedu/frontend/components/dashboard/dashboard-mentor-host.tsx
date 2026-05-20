"use client";

import { AiMentorChat } from "@/components/ai/AiMentorChat";
import { buildDashboardMentorLabels } from "@/lib/ai/mentor-ui/dashboard-context";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

export function DashboardMentorHost({
  stats,
  modules,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
}) {
  return (
    <AiMentorChat
      moduleId={stats.currentModuleId}
      contextLabels={buildDashboardMentorLabels(stats, modules)}
    />
  );
}
