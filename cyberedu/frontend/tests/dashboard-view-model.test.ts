import { describe, expect, it } from "vitest";
import type { AchievementRow } from "@/lib/achievements";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import {
  assertCleanDashboardViewPayload,
  buildStudentDashboardViewModel,
  collectForbiddenDashboardKeys,
} from "@/lib/dashboard-view-mapper";
import { DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS } from "@/types/dashboard-view-model";

function moduleRow(
  over: Partial<CourseProgressModuleRow> & { id?: string } = {},
): CourseProgressModuleRow {
  const id = over.id ?? "m1";
  return {
    module: { id, title: `Module ${id}`, description: null, orderNumber: over.module?.orderNumber ?? 1 },
    requirements: {
      lessonRequired: true,
      testRequired: true,
      practiceRequired: true,
      totalSteps: 3,
      ...over.requirements,
    },
    progress: {
      lessonCompleted: false,
      testCompleted: false,
      practiceCompleted: false,
      videoCompleted: false,
      ...over.progress,
    },
    unlocked: over.unlocked ?? true,
    moduleCompleted: over.moduleCompleted ?? false,
    progressPercent: over.progressPercent ?? 0,
    ...over,
  } as CourseProgressModuleRow;
}

function baseStats(over: Partial<ProfileCourseStats> = {}): ProfileCourseStats {
  return {
    courseId: "c1",
    courseTitle: "Кибербезопасность",
    completedModules: 0,
    totalModules: 1,
    progressPercent: 0,
    totalPoints: 0,
    maxPossiblePoints: 100,
    scoreSuccessPercent: 0,
    averageTestPercent: null,
    testAttemptCount: 0,
    testsPassedCount: 0,
    practicesCompleted: 0,
    practicesTotal: 1,
    completedModuleRows: [],
    currentModuleTitle: "Module m1",
    currentModuleId: "m1",
    allModulesComplete: false,
    certificateIssued: false,
    certificateId: null,
    certificateNumber: null,
    certificateVerifyUrl: null,
    issuedAt: null,
    canGenerateCertificate: false,
    modulesUntilCertificate: 1,
    lastLesson: null,
    lastTest: null,
    lastPractice: null,
    lastActivitySummary: null,
    certificateDisplayState: "unavailable",
    recentTests: [],
    recentSubmissions: [],
    ...over,
  };
}

const achievementRows: AchievementRow[] = [
  {
    kind: "FIRST_MODULE_COMPLETE",
    slug: "first-step",
    title: "Первый шаг",
    description: "Первый модуль курса закрыт.",
    hintLocked: "Завершите первый модуль.",
    unlocked: false,
    unlockedAt: null,
  },
];

describe("dashboard view model", () => {
  it("defines forbidden keys contract", () => {
    expect(DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS).toEqual(
      expect.arrayContaining(["answerKey", "solution", "hiddenRubric", "apiKey", "env"]),
    );
  });

  it("buildStudentDashboardViewModel maps progress and next step", () => {
    const vm = buildStudentDashboardViewModel({
      userId: "u1",
      displayName: "Анна",
      stats: baseStats(),
      modules: [moduleRow({ id: "m1" })],
      achievements: achievementRows,
    });

    expect(vm.user.id).toBe("u1");
    expect(vm.user.displayName).toBe("Анна");
    expect(vm.course.title).toBe("Кибербезопасность");
    expect(vm.progress.totalLessons).toBe(1);
    expect(vm.nextStep?.type).toBe("lesson");
    expect(vm.nextStep?.href).toContain("/lesson");
    expect(vm.roadmapPreview.length).toBeGreaterThan(0);
    expect(vm.aiSuggestions).toHaveLength(4);
    expect(vm.aiSuggestions[0]?.mode).toBe("explain_module");
  });

  it("maps certificate finish state", () => {
    const vm = buildStudentDashboardViewModel({
      userId: "u1",
      displayName: "Анна",
      stats: baseStats({
        allModulesComplete: true,
        completedModules: 1,
        canGenerateCertificate: true,
        progressPercent: 100,
      }),
      modules: [moduleRow({ id: "m1", moduleCompleted: true })],
      achievements: achievementRows,
    });

    expect(vm.nextStep?.type).toBe("certificate");
    expect(vm.certificate.status).toBe("ready");
    expect(vm.certificate.href).toBe("/dashboard/certificate");
  });

  it("maps weak topics without answer fields", () => {
    const vm = buildStudentDashboardViewModel({
      userId: "u1",
      displayName: "Анна",
      stats: baseStats({
        lastTest: {
          testTitle: "Контроль 1",
          moduleTitle: "Module m1",
          passed: false,
          percent: 40,
          at: "2026-05-01T00:00:00.000Z",
        },
      }),
      modules: [moduleRow({ id: "m1", module: { id: "m1", title: "Module m1", description: null, orderNumber: 1 } })],
      achievements: achievementRows,
    });

    expect(vm.weakTopics.length).toBeGreaterThan(0);
    expect(vm.weakTopics[0]?.title).toBeTruthy();
    expect(vm.recommendations.some((r) => r.type === "ai")).toBe(true);
  });

  it("assertCleanDashboardViewPayload rejects forbidden keys", () => {
    const vm = buildStudentDashboardViewModel({
      userId: "u1",
      displayName: "Анна",
      stats: baseStats(),
      modules: [moduleRow()],
      achievements: achievementRows,
    });

    expect(() => assertCleanDashboardViewPayload(vm)).not.toThrow();

    expect(() =>
      assertCleanDashboardViewPayload({
        ...vm,
        progress: { ...vm.progress, answerKey: "secret" },
      }),
    ).toThrow(/forbidden keys/i);
  });

  it("collectForbiddenDashboardKeys finds nested leaks", () => {
    const keys = collectForbiddenDashboardKeys({
      user: { id: "u1" },
      nested: { solutionText: "full answer", correctOptionId: "a" },
    });
    expect(keys).toEqual(expect.arrayContaining(["solutionText", "correctOptionId"]));
  });
});
