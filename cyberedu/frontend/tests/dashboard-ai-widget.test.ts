import { describe, expect, it } from "vitest";
import {
  buildDashboardAIMentorContextInput,
  buildDashboardAiWidgetQuickActions,
  buildDashboardAiWidgetSuggestedPrompts,
  buildWeakTopicMentorPrompt,
  DASHBOARD_AI_WIDGET_INTRO,
  DASHBOARD_MENTOR_PAGE_PATH,
} from "@/lib/dashboard-ai-widget";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

const baseStats = {
  courseId: "c1",
  courseTitle: "Курс",
  currentModuleId: "m1",
  currentModuleTitle: "Модуль 1",
  completedModules: 0,
  totalModules: 3,
  modulesUntilCertificate: 3,
  allModulesComplete: false,
  canGenerateCertificate: false,
  certificateIssued: false,
  certificateNumber: null,
  averageTestPercent: null,
  lastLesson: null,
  lastTest: null,
  lastPractice: null,
} as ProfileCourseStats;

const modules = [
  {
    module: { id: "m1", title: "Введение", orderNumber: 1 },
    unlocked: true,
    moduleCompleted: false,
    requirements: {
      lessonRequired: true,
      testRequired: true,
      practiceRequired: true,
      totalSteps: 3,
    },
    progress: {
      lessonCompleted: false,
      testCompleted: false,
      practiceCompleted: false,
      videoCompleted: false,
    },
  },
] as unknown as CourseProgressModuleRow[];

describe("dashboard-ai-widget", () => {
  it("exposes intro copy and mentor page path", () => {
    expect(DASHBOARD_AI_WIDGET_INTRO).toMatch(/практик/i);
    expect(DASHBOARD_MENTOR_PAGE_PATH).toBe("/dashboard/mentor");
  });

  it("lists four quick actions", () => {
    const actions = buildDashboardAiWidgetQuickActions(baseStats, modules, []);
    expect(actions).toHaveLength(4);
    expect(actions.map((a) => a.label)).toEqual([
      "Объяснить текущую тему",
      "Повторить слабую тему",
      "Подготовиться к практике",
      "Сделать план обучения",
    ]);
  });

  it("uses fallback prompts when no weak topics", () => {
    const prompts = buildDashboardAiWidgetSuggestedPrompts([]);
    expect(prompts).toHaveLength(3);
    expect(prompts.map((p) => p.label)).toEqual([
      "С чего начать курс?",
      "Как распознавать фишинг?",
      "Как подготовиться к практике?",
    ]);
  });

  it("builds weak-topic prompts from recommendations", () => {
    const weak = [
      {
        id: "weak-test",
        title: "Тест по фишингу",
        reason: "Не зачтён",
        href: "/dashboard/course/m1/test",
        tone: "warning" as const,
      },
    ];
    const prompts = buildDashboardAiWidgetSuggestedPrompts(weak);
    expect(buildWeakTopicMentorPrompt("Тест по фишингу")).toBe("Объясни тему: Тест по фишингу");
    expect(prompts[0]?.text).toBe("Объясни тему: Тест по фишингу");
    expect(prompts[0]?.text).not.toMatch(/answerKey|solution|rubric/i);
  });

  it("builds dashboard mentor context with weak topic titles only", () => {
    const weak = [
      {
        id: "w1",
        title: "Пароли",
        reason: "Низкий балл",
        href: "/x",
        tone: "info" as const,
      },
    ];
    const ctx = buildDashboardAIMentorContextInput(baseStats, modules, weak);
    expect(ctx.sourceType).toBe("dashboard");
    expect(ctx.weakTopics).toEqual(["Пароли"]);
    expect(ctx.moduleTitle).toBe("Введение");
  });
});
