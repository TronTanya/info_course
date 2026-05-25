import { describe, expect, it } from "vitest";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";
import {
  hasDashboardLearningProgress,
  hasDashboardRecentActivity,
  hasDashboardRecommendations,
  shouldShowDashboardNotStarted,
} from "@/lib/dashboard-page-state-ui";

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

describe("dashboard-page-state-ui", () => {
  it("shouldShowDashboardNotStarted when course has modules but no progress", () => {
    expect(
      shouldShowDashboardNotStarted(baseStats(), [moduleRow({ id: "m1" }), moduleRow({ id: "m2" })]),
    ).toBe(true);
  });

  it("hasDashboardLearningProgress when lesson exists", () => {
    expect(
      hasDashboardLearningProgress(
        baseStats({
          lastLesson: { lessonTitle: "L", moduleTitle: "M", at: "2026-01-01T00:00:00.000Z" },
        }),
      ),
    ).toBe(true);
    expect(
      shouldShowDashboardNotStarted(
        baseStats({ lastLesson: { lessonTitle: "L", moduleTitle: "M", at: "2026-01-01T00:00:00.000Z" } }),
        [moduleRow({ id: "m1" })],
      ),
    ).toBe(false);
  });

  it("hasDashboardRecentActivity is false without events", () => {
    expect(hasDashboardRecentActivity(baseStats(), [moduleRow({ id: "m1" })])).toBe(false);
  });

  it("hasDashboardRecommendations when last test failed", () => {
    expect(
      hasDashboardRecommendations(
        baseStats({
          lastTest: {
            testTitle: "T",
            moduleTitle: "M1",
            passed: false,
            percent: 50,
            at: "2026-05-01T00:00:00.000Z",
          },
        }),
        [moduleRow({ id: "m1" })],
      ),
    ).toBe(true);
  });
});
