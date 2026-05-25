import { buildRecentActivityFeedItems } from "@/lib/recent-activity-feed";
import { buildWeakTopicPanelItems } from "@/lib/weak-topics-panel";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

export type { DashboardEmptyKind } from "@/lib/dashboard-empty-copy";
export { DASHBOARD_EMPTY_COPY } from "@/lib/dashboard-empty-copy";

/** Есть ли зафиксированный учебный прогресс (без служебных audit-полей). */
export function hasDashboardLearningProgress(stats: ProfileCourseStats): boolean {
  return (
    stats.progressPercent > 0 ||
    stats.completedModules > 0 ||
    Boolean(stats.lastLesson || stats.lastTest || stats.lastPractice) ||
    stats.recentTests.length > 0 ||
    stats.recentSubmissions.some((s) => s.status !== "DRAFT")
  );
}

export function shouldShowDashboardNotStarted(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): boolean {
  return stats.totalModules > 0 && modules.length > 0 && !hasDashboardLearningProgress(stats);
}

/** Курс есть, но учебных событий ещё не зафиксировано (для блока прогресса). */
export function shouldShowDashboardNoProgress(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): boolean {
  return shouldShowDashboardNotStarted(stats, modules);
}

export function hasDashboardRecommendations(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): boolean {
  return buildWeakTopicPanelItems(stats, modules).length > 0;
}

export function hasDashboardRecentActivity(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): boolean {
  return buildRecentActivityFeedItems(stats, modules).length > 0;
}
