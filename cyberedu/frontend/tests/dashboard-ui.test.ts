import { describe, expect, it } from "vitest";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";
import {
  buildRecentActivities,
  buildUpcomingTasks,
  computeStepMetrics,
  getContinueFromModules,
  getContinueTarget,
  welcomeStatusLabel,
} from "@/lib/dashboard-ui";

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
    courseTitle: "ИБ курс",
    completedModules: 0,
    totalModules: 2,
    progressPercent: 0,
    totalPoints: 0,
    maxPossiblePoints: 100,
    scoreSuccessPercent: 0,
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
    ...over,
  };
}

describe("dashboard-ui", () => {
  it("computeStepMetrics aggregates lesson and test completion", () => {
    const metrics = computeStepMetrics([
      moduleRow({
        progress: {
          lessonCompleted: true,
          videoCompleted: false,
          testCompleted: false,
          practiceCompleted: false,
          moduleCompleted: false,
        } as ProgressRow,
      }),
    ]);
    expect(metrics.lessonsDone).toBe(1);
    expect(metrics.lessonsTotal).toBe(1);
    expect(metrics.testsDone).toBe(0);
    expect(metrics.testsTotal).toBe(1);
  });

  it("buildUpcomingTasks prefers lesson before test", () => {
    const tasks = buildUpcomingTasks([moduleRow({ id: "m1" })]);
    expect(tasks[0]?.kind).toBe("lesson");
    expect(tasks[0]?.href).toContain("/lesson");
  });

  it("buildRecentActivities sorts by date descending", () => {
    const items = buildRecentActivities(
      baseStats({
        lastLesson: { lessonTitle: "L1", moduleTitle: "M1", at: "2026-01-01T00:00:00.000Z" },
        lastTest: {
          testTitle: "T1",
          moduleTitle: "M1",
          passed: true,
          percent: 90,
          at: "2026-05-01T00:00:00.000Z",
        },
      }),
    );
    expect(items[0]?.kind).toBe("test");
    expect(items[1]?.kind).toBe("lesson");
  });

  it("getContinueFromModules points to certificate when all modules done", () => {
    const c = getContinueFromModules(
      [moduleRow({ moduleCompleted: true }), moduleRow({ id: "m2", moduleCompleted: true })],
      "Курс",
    );
    expect(c.href).toBe("/dashboard/certificate");
  });

  it("getContinueTarget uses current module row title when set", () => {
    const target = getContinueTarget(
      baseStats({ currentModuleId: "m1", currentModuleTitle: "Введение" }),
      [moduleRow({ id: "m1", module: { id: "m1", title: "Введение", description: null, orderNumber: 1 } })],
    );
    expect(target.href).toContain("/dashboard/course/m1");
    expect(target.title).toBe("Введение");
  });

  it("welcomeStatusLabel reflects completion", () => {
    expect(welcomeStatusLabel(baseStats({ allModulesComplete: true }))).toMatch(/завершён/i);
    expect(welcomeStatusLabel(baseStats({ currentModuleTitle: "Модуль 1" }))).toContain("Модуль 1");
  });
});
