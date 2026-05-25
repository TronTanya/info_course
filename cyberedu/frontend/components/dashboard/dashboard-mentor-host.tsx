"use client";

import {
  DashboardMentorSection,
  DashboardMentorWidgetSlot,
} from "@/components/dashboard/dashboard-mentor-section";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

/** @deprecated Используйте `DashboardMentorSection` + `DashboardMentorWidgetSlot`. */
export function DashboardMentorHost({
  stats,
  modules,
  aiConfigured = true,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
  aiConfigured?: boolean;
}) {
  return (
    <DashboardMentorSection stats={stats} modules={modules} aiConfigured={aiConfigured}>
      <DashboardMentorWidgetSlot stats={stats} modules={modules} aiConfigured={aiConfigured} />
    </DashboardMentorSection>
  );
}
