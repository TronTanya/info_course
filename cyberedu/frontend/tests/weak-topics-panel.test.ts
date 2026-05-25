import { describe, expect, it } from "vitest";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import {
  buildWeakTopicPanelItems,
  enrichWeakTopicForPanel,
  getFirstAvailableTestHref,
} from "@/lib/weak-topics-panel";

function moduleRow(over: Partial<CourseProgressModuleRow> = {}): CourseProgressModuleRow {
  return {
    module: { id: "m1", title: "Анализ доменов", description: null, orderNumber: 3, ...over.module },
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: true,
      practiceRequired: true,
      totalSteps: 3,
      ...over.requirements,
    },
    contentCounts: { lessons: 1, tests: 1, practices: 1 },
    progress: over.progress ?? null,
    unlocked: over.unlocked ?? true,
    progressPercent: over.progressPercent ?? 0,
    score: over.score ?? 0,
    moduleCompleted: over.moduleCompleted ?? false,
    ...over,
  };
}

function baseStats(over: Partial<ProfileCourseStats> = {}): ProfileCourseStats {
  return {
    courseTitle: "Курс",
    totalModules: 1,
    completedModules: 0,
    allModulesComplete: false,
    overallProgressPercent: 10,
    totalScore: 0,
    maxPossiblePoints: 100,
    scoreSuccessPercent: 10,
    certificateIssued: false,
    canGenerateCertificate: false,
    currentModuleId: "m1",
    currentModuleTitle: "Анализ доменов",
    lastTest: null,
    lastPractice: null,
    lastLesson: null,
    lastActivity: null,
    recentTests: [],
    recentSubmissions: [],
    ...over,
  } as ProfileCourseStats;
}

describe("weak-topics-panel", () => {
  it("enrichWeakTopicForPanel links failed test to lesson CTA", () => {
    const modules = [moduleRow()];
    const item = enrichWeakTopicForPanel(
      {
        id: "weak-test",
        title: "Контрольный тест",
        reason: "Тест не зачтён — 40% в модуле «Анализ доменов»",
        href: "/dashboard/course/m1/test",
        tone: "warning",
      },
      modules,
    );
    expect(item.lessonTitle).toBe("Анализ доменов");
    expect(item.lessonHref).toContain("/lesson");
    expect(item.href).toBe(item.lessonHref);
    expect(item.ctaLabel).toBe("Повторить урок");
    expect(item.difficulty).toBe("Средний");
  });

  it("buildWeakTopicPanelItems without test failures only adds proactive hints", () => {
    const items = buildWeakTopicPanelItems(
      baseStats({ scoreSuccessPercent: 80, maxPossiblePoints: 100 }),
      [moduleRow({ moduleCompleted: true, progress: { lessonCompleted: true, videoCompleted: false, testCompleted: true, practiceCompleted: true, moduleCompleted: true } as ProgressRow })],
    );
    expect(items.every((i) => i.id !== "weak-test")).toBe(true);
  });

  it("buildWeakTopicPanelItems includes failed test recommendation", () => {
    const items = buildWeakTopicPanelItems(
      baseStats({
        lastTest: {
          testTitle: "Контроль",
          moduleTitle: "Анализ доменов",
          passed: false,
          percent: 35,
          at: "2026-05-01T00:00:00.000Z",
        },
      }),
      [moduleRow()],
    );
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]?.reason).toContain("35%");
  });

  it("getFirstAvailableTestHref finds unlocked module test", () => {
    expect(getFirstAvailableTestHref([moduleRow()])).toBe("/dashboard/course/m1/test");
    expect(getFirstAvailableTestHref([moduleRow({ unlocked: false })])).toBeNull();
  });
});
