"use client";

import { AiMentorChat } from "@/components/ai/AiMentorChat";
import { buildDashboardMentorLabels } from "@/lib/ai/mentor-ui/dashboard-context";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { cn } from "@/lib/utils";

/** Docked AI mentor for dashboard desktop rail (xl+). */
export function MentorDockedPanel({
  stats,
  modules,
  className,
}: {
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
  className?: string;
}) {
  return (
    <div className={cn("ce-cockpit-ai-rail min-h-0", className)}>
      <AiMentorChat
        presentation="docked"
        moduleId={stats.currentModuleId}
        contextLabels={buildDashboardMentorLabels(stats, modules)}
        className="min-h-[min(72dvh,36rem)]"
      />
    </div>
  );
}
