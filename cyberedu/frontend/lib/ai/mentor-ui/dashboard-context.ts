import type { MentorContextLabels } from "@/lib/ai/mentor-ui/types";
import { formatMentorTestSummary } from "@/lib/ai/mentor-ui/test-summary";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

export function buildDashboardMentorLabels(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): MentorContextLabels {
  const mod = stats.currentModuleId
    ? modules.find((m) => m.module.id === stats.currentModuleId)
    : null;
  const moduleTitle = mod?.module.title ?? stats.currentModuleTitle ?? undefined;

  const labels: MentorContextLabels = {
    moduleTitle,
    topic: moduleTitle,
  };

  if (stats.lastTest) {
    labels.testSummary = formatMentorTestSummary({
      title: stats.lastTest.testTitle,
      percent: stats.lastTest.percent,
      passed: stats.lastTest.passed,
    });
  }

  return labels;
}
