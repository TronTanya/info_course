import { computeStepMetrics } from "@/lib/dashboard-ui";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import type { DashboardProgress } from "@/types/dashboard-view-model";

export const EMPTY_DASHBOARD_PROGRESS: DashboardProgress = {
  percentage: 0,
  completedModules: 0,
  totalModules: 0,
  completedLessons: 0,
  totalLessons: 0,
  passedTests: 0,
  totalTests: 0,
  approvedPractices: 0,
  totalPractices: 0,
};

export function buildDashboardProgressFromStats(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardProgress {
  const steps = computeStepMetrics(modules);
  return {
    percentage: stats.progressPercent,
    completedModules: stats.completedModules,
    totalModules: stats.totalModules,
    completedLessons: steps.lessonsDone,
    totalLessons: steps.lessonsTotal,
    passedTests: steps.testsDone,
    totalTests: steps.testsTotal,
    approvedPractices: steps.practiceDone,
    totalPractices: steps.practiceTotal,
  };
}

/** Курс загружен и есть хотя бы один модуль для отображения метрик. */
export function hasOverallProgressData(progress: DashboardProgress): boolean {
  return progress.totalModules > 0;
}

export function formatOverallProgressCourseCopy(percentage: number): string {
  return `Вы прошли ${percentage}% курса`;
}

function pluralizeModuleRu(count: number): string {
  const abs = Math.abs(count) % 100;
  const n1 = abs % 10;
  if (abs > 10 && abs < 20) return "модулей";
  if (n1 > 1 && n1 < 5) return "модуля";
  if (n1 === 1) return "модуль";
  return "модулей";
}

export function formatModulesUntilCertificateCopy(modulesRemaining: number): string | null {
  if (modulesRemaining <= 0) return null;
  return `До сертификата осталось ${modulesRemaining} ${pluralizeModuleRu(modulesRemaining)}`;
}

export function formatMetricRatio(done: number, total: number): string {
  return total > 0 ? `${done}/${total}` : "—";
}
