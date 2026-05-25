import { describe, expect, it } from "vitest";
import { DASHBOARD_EMPTY_COPY } from "@/lib/dashboard-empty-copy";
import {
  hasDashboardLearningProgress,
  hasDashboardRecentActivity,
  hasDashboardRecommendations,
} from "@/lib/dashboard-page-state-ui";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";

function moduleRow(over: Partial<CourseProgressModuleRow> & { id?: string }): CourseProgressModuleRow {
  const id = over.id ?? "m1";
  return {
    module: { id, title: `Module ${id}`, description: null, orderNumber: 1 },
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: false,
      practiceRequired: false,
      totalSteps: 1,
      ...over.requirements,
    },
    contentCounts: { lessons: 1, tests: 0, practices: 0, ...over.contentCounts },
    progress:
      over.progress ??
      ({
        lessonCompleted: false,
        videoCompleted: false,
        testCompleted: false,
        practiceCompleted: false,
        moduleCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ProgressRow),
    unlocked: over.unlocked ?? true,
    progressPercent: 0,
    score: 0,
    moduleCompleted: over.moduleCompleted ?? false,
    ...over,
  };
}

function baseStats(over: Partial<ProfileCourseStats> = {}): ProfileCourseStats {
  return {
    courseId: "c1",
    courseTitle: "Курс",
    completedModules: 0,
    totalModules: 2,
    progressPercent: 0,
    totalPoints: 0,
    maxPossiblePoints: 100,
    scoreSuccessPercent: 0,
    averageTestPercent: null,
    testAttemptCount: 0,
    testsPassedCount: 0,
    practicesCompleted: 0,
    practicesTotal: 0,
    completedModuleRows: [],
    currentModuleTitle: null,
    currentModuleId: null,
    allModulesComplete: false,
    certificateIssued: false,
    certificateId: null,
    certificateNumber: null,
    certificateVerifyUrl: null,
    issuedAt: null,
    canGenerateCertificate: false,
    modulesUntilCertificate: 2,
    lastLesson: null,
    lastTest: null,
    lastPractice: null,
    lastActivitySummary: null,
    certificateDisplayState: "unavailable",
    recentTests: [],
    recentSubmissions: [],
    weakTopics: [],
    ...over,
  } as ProfileCourseStats;
}

describe("dashboard page empty copy", () => {
  it("covers all empty kinds with safe user-facing text", () => {
    for (const kind of Object.keys(DASHBOARD_EMPTY_COPY) as (keyof typeof DASHBOARD_EMPTY_COPY)[]) {
      const copy = DASHBOARD_EMPTY_COPY[kind];
      expect(copy.title.length).toBeGreaterThan(2);
      expect(copy.description).not.toMatch(/prisma|postgres|stack|userId|user-agent/i);
      expect(copy.description).not.toMatch(/^[a-f0-9-]{8,}$/i);
    }
  });

  it("hasDashboardRecommendations and activity reflect data", () => {
    const modules = [moduleRow({ id: "m1" })];
    const empty = baseStats();
    expect(hasDashboardRecommendations(empty, modules)).toBe(false);
    expect(hasDashboardRecentActivity(empty, modules)).toBe(false);

    const withTest = baseStats({
      recentTests: [
        {
          testTitle: "T",
          moduleTitle: "M1",
          moduleId: "m1",
          passed: true,
          percent: 90,
          at: "2026-05-01T00:00:00.000Z",
        },
      ],
    });
    expect(hasDashboardLearningProgress(withTest)).toBe(true);
    expect(hasDashboardRecentActivity(withTest, modules)).toBe(true);
  });
});
