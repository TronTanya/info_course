import { describe, expect, it } from "vitest";
import { buildDashboardAIMentorContextInput } from "@/lib/dashboard-ai-widget";
import {
  buildWeakTopicRecommendations,
  getPendingPracticeReviews,
} from "@/lib/dashboard-ui";
import { dashboardHrefForModuleRow } from "@/lib/dashboard-learning-links";
import { sanitizeStudentFeedback } from "@/lib/submission-status-panel";
import { sanitizeAIContext } from "@/lib/ai/safety/mentor-policy";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

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
    currentModuleTitle: "М1",
    currentModuleId: "m1",
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
    ...over,
  };
}

function moduleRow(
  id: string,
  unlocked: boolean,
  over: Partial<CourseProgressModuleRow> = {},
): CourseProgressModuleRow {
  return {
    module: { id, title: `Module ${id}`, description: null, orderNumber: 1 },
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: true,
      practiceRequired: false,
      totalSteps: 2,
    },
    contentCounts: { lessons: 1, tests: 1, practices: 0 },
    progress: null,
    unlocked,
    progressPercent: 0,
    score: 0,
    moduleCompleted: false,
    ...over,
  };
}

describe("dashboard security (ETAP 17)", () => {
  it("dashboardHrefForModuleRow blocks deep links into locked modules", () => {
    expect(dashboardHrefForModuleRow(moduleRow("m2", false), "test")).toBe("/dashboard/course");
    expect(dashboardHrefForModuleRow(moduleRow("m1", true), "lesson")).toBe(
      "/dashboard/course/m1/lesson",
    );
  });

  it("weak topic links do not target test/practice on locked modules", () => {
    const modules = [moduleRow("m1", true), moduleRow("m2", false)];
    const stats = baseStats({
      lastTest: {
        testTitle: "Тест",
        moduleTitle: "Module m2",
        passed: false,
        percent: 40,
        at: new Date().toISOString(),
      },
    });
    const items = buildWeakTopicRecommendations(stats, modules);
    const weakTest = items.find((i) => i.id === "weak-test");
    expect(weakTest?.href).toBe("/dashboard/course");
  });

  it("pending practice links respect module unlock", () => {
    const modules = [moduleRow("m1", false)];
    const stats = baseStats({
      recentSubmissions: [
        {
          taskTitle: "Лаб",
          moduleTitle: "Module m1",
          moduleId: "m1",
          status: "SUBMITTED",
          statusLabel: "На проверке",
          outcome: "pending",
          at: new Date().toISOString(),
        },
      ],
    });
    const items = getPendingPracticeReviews(stats, modules);
    expect(items[0]?.href).toBe("/dashboard/course");
  });

  it("sanitizeStudentFeedback strips rubric and answer key patterns", () => {
    expect(
      sanitizeStudentFeedback("Смотрите hidden rubric и answer key внутри."),
    ).toBeUndefined();
    expect(sanitizeStudentFeedback("Хорошая работа, доработайте выводы.")).toBe(
      "Хорошая работа, доработайте выводы.",
    );
  });

  it("dashboard AI context exposes only safe weak topic titles", () => {
    const ctx = buildDashboardAIMentorContextInput(
      baseStats(),
      [moduleRow("m1", true)],
      [
        {
          id: "w1",
          title: "Фишинг",
          reason: "Низкий балл 12% — answerKey leak",
          href: "/x",
          tone: "warning",
        },
      ],
    );
    expect(ctx.weakTopics).toEqual(["Фишинг"]);
    expect(JSON.stringify(ctx)).not.toMatch(/answerKey|solution|rubric/i);

    const poisoned = sanitizeAIContext({
      sourceType: "dashboard",
      weakTopics: ["Тема"],
      answerKey: "secret",
      hiddenRubric: "internal",
    });
    expect(poisoned.context).not.toHaveProperty("answerKey");
    expect(poisoned.strippedKeys.length).toBeGreaterThan(0);
  });
});
