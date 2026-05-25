import { describe, expect, it } from "vitest";
import {
  EMPTY_DASHBOARD_PROGRESS,
  buildDashboardProgressFromStats,
  formatModulesUntilCertificateCopy,
  formatOverallProgressCourseCopy,
  hasOverallProgressData,
} from "@/lib/overall-progress-panel";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

describe("overall-progress-panel helpers", () => {
  it("formatOverallProgressCourseCopy", () => {
    expect(formatOverallProgressCourseCopy(62)).toBe("Вы прошли 62% курса");
    expect(formatOverallProgressCourseCopy(0)).toBe("Вы прошли 0% курса");
  });

  it("formatModulesUntilCertificateCopy pluralizes modules", () => {
    expect(formatModulesUntilCertificateCopy(0)).toBeNull();
    expect(formatModulesUntilCertificateCopy(1)).toBe("До сертификата осталось 1 модуль");
    expect(formatModulesUntilCertificateCopy(2)).toBe("До сертификата осталось 2 модуля");
    expect(formatModulesUntilCertificateCopy(5)).toBe("До сертификата осталось 5 модулей");
    expect(formatModulesUntilCertificateCopy(22)).toBe("До сертификата осталось 22 модуля");
  });

  it("hasOverallProgressData is false when no modules", () => {
    expect(hasOverallProgressData(EMPTY_DASHBOARD_PROGRESS)).toBe(false);
    expect(
      hasOverallProgressData({
        ...EMPTY_DASHBOARD_PROGRESS,
        totalModules: 3,
      }),
    ).toBe(true);
  });

  it("buildDashboardProgressFromStats maps step metrics", () => {
    const stats = {
      progressPercent: 40,
      completedModules: 2,
      totalModules: 5,
    } as ProfileCourseStats;

    const modules = [
      {
        requirements: { lessonRequired: true, testRequired: true, practiceRequired: false },
        progress: { lessonCompleted: true, testCompleted: false, practiceCompleted: false },
      },
      {
        requirements: { lessonRequired: true, testRequired: false, practiceRequired: true },
        progress: { lessonCompleted: true, testCompleted: false, practiceCompleted: true },
      },
    ] as CourseProgressModuleRow[];

    const progress = buildDashboardProgressFromStats(stats, modules);
    expect(progress.percentage).toBe(40);
    expect(progress.completedModules).toBe(2);
    expect(progress.totalModules).toBe(5);
    expect(progress.completedLessons).toBe(2);
    expect(progress.totalLessons).toBe(2);
    expect(progress.passedTests).toBe(0);
    expect(progress.totalTests).toBe(1);
    expect(progress.approvedPractices).toBe(1);
    expect(progress.totalPractices).toBe(1);
  });
});
