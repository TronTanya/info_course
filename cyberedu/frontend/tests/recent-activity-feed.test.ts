import { describe, expect, it } from "vitest";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";
import {
  RECENT_ACTIVITY_EMPTY_MESSAGE,
  RECENT_ACTIVITY_FEED_MAX,
  RECENT_ACTIVITY_TYPE_LABELS,
  buildRecentActivityFeedItems,
} from "@/lib/recent-activity-feed";

function moduleRow(over: Partial<CourseProgressModuleRow> & { id?: string }): CourseProgressModuleRow {
  const id = over.id ?? "m1";
  return {
    module: { id, title: `Module ${id}`, description: null, orderNumber: over.module?.orderNumber ?? 1 },
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: true,
      practiceRequired: false,
      totalSteps: 2,
      ...over.requirements,
    },
    contentCounts: { lessons: 1, tests: 1, practices: 0, ...over.contentCounts },
    progress:
      over.progress ??
      ({
        lessonCompleted: false,
        videoCompleted: false,
        testCompleted: false,
        practiceCompleted: false,
        moduleCompleted: false,
        createdAt: new Date("2026-05-01T08:00:00.000Z"),
        updatedAt: new Date("2026-05-01T09:00:00.000Z"),
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

describe("recent-activity-feed", () => {
  it("exposes empty message and type labels", () => {
    expect(RECENT_ACTIVITY_EMPTY_MESSAGE).toMatch(/история вашего обучения/i);
    expect(RECENT_ACTIVITY_TYPE_LABELS.module_opened).toBe("Открыт новый модуль");
  });

  it("returns empty array when no events", () => {
    expect(buildRecentActivityFeedItems(baseStats(), [])).toEqual([]);
  });

  it("builds student-safe events with hrefs and caps at max", () => {
    const items = buildRecentActivityFeedItems(
      baseStats({
        certificateIssued: true,
        issuedAt: new Date("2026-05-20T12:00:00.000Z"),
        certificateNumber: "CE-2026-TEST",
        recentTests: [
          {
            testTitle: "Тест 1",
            moduleTitle: "M1",
            moduleId: "m1",
            passed: true,
            percent: 90,
            at: "2026-05-19T10:00:00.000Z",
          },
        ],
        recentSubmissions: [
          {
            taskTitle: "Лаб",
            moduleTitle: "M1",
            moduleId: "m1",
            status: "CHECKING",
            statusLabel: "На проверке",
            outcome: "pending",
            at: "2026-05-18T10:00:00.000Z",
          },
        ],
      }),
      [
        moduleRow({
          id: "m2",
          unlocked: true,
          module: { id: "m2", title: "Модуль 2", description: null, orderNumber: 2 },
        }),
      ],
    );

    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(RECENT_ACTIVITY_FEED_MAX);
    expect(items.some((i) => i.type === "certificate_issued")).toBe(true);
    expect(items.some((i) => i.type === "test_passed")).toBe(true);
    expect(items.some((i) => i.type === "practice_submitted")).toBe(true);
    expect(items.every((i) => i.href?.startsWith("/dashboard") ?? true)).toBe(true);
    expect(JSON.stringify(items)).not.toMatch(/ipAddress|userAgent|audit|security/i);
  });

  it("sorts by date descending", () => {
    const items = buildRecentActivityFeedItems(
      baseStats({
        lastLesson: {
          lessonTitle: "Урок",
          moduleTitle: "M1",
          at: "2026-05-01T00:00:00.000Z",
        },
        recentTests: [
          {
            testTitle: "T",
            moduleTitle: "M1",
            moduleId: "m1",
            passed: true,
            percent: 100,
            at: "2026-05-10T00:00:00.000Z",
          },
        ],
      }),
      [],
    );
    expect(new Date(items[0]!.createdAt).getTime()).toBeGreaterThan(
      new Date(items[items.length - 1]!.createdAt).getTime(),
    );
  });
});
