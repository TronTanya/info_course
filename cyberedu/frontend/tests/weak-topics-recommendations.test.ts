import { describe, expect, it } from "vitest";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import {
  buildLearningRecommendationCards,
  buildRecordedWeakTopics,
  buildWeakTopicsRecommendationsView,
  hasWeakTopicsRecommendationsContent,
  isRecordedWeakTopic,
} from "@/lib/weak-topics-recommendations";

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
    courseId: "c1",
    courseTitle: "Курс",
    totalModules: 1,
    completedModules: 0,
    progressPercent: 0,
    totalPoints: 0,
    maxPossiblePoints: 100,
    scoreSuccessPercent: 10,
    allModulesComplete: false,
    certificateIssued: false,
    canGenerateCertificate: false,
    currentModuleId: "m1",
    currentModuleTitle: "Анализ доменов",
    lastTest: null,
    lastPractice: null,
    lastLesson: null,
    lastActivitySummary: null,
    recentTests: [],
    recentSubmissions: [],
    ...over,
  } as ProfileCourseStats;
}

describe("weak-topics-recommendations", () => {
  it("isRecordedWeakTopic distinguishes failures from hints", () => {
    expect(isRecordedWeakTopic("weak-test")).toBe(true);
    expect(isRecordedWeakTopic("upcoming-test")).toBe(false);
    expect(isRecordedWeakTopic("weak-score")).toBe(false);
  });

  it("buildRecordedWeakTopics includes failed test with Повторить CTA", () => {
    const weak = buildRecordedWeakTopics(
      baseStats({
        lastTest: {
          testTitle: "Контроль",
          moduleTitle: "Анализ доменов",
          passed: false,
          percent: 40,
          at: "2026-05-01T00:00:00.000Z",
        },
      }),
      [moduleRow()],
    );
    expect(weak).toHaveLength(1);
    expect(weak[0]?.ctaLabel).toBe("Повторить");
    expect(weak[0]?.reason).toContain("40%");
    expect(weak[0]?.lessonHref).toContain("/lesson");
  });

  it("buildRecordedWeakTopics excludes proactive upcoming-test hint", () => {
    const weak = buildRecordedWeakTopics(baseStats(), [moduleRow()]);
    expect(weak.every((w) => w.id !== "upcoming-test")).toBe(true);
  });

  it("buildLearningRecommendationCards includes lesson test practice and ai", () => {
    const recs = buildLearningRecommendationCards(baseStats(), [
      moduleRow({
        progress: {
          lessonCompleted: true,
          videoCompleted: false,
          testCompleted: true,
          practiceCompleted: false,
          moduleCompleted: false,
        } as ProgressRow,
      }),
    ]);
    const kinds = recs.map((r) => r.kind);
    expect(kinds).toContain("lesson");
    expect(kinds).not.toContain("test");
    expect(kinds).toContain("practice");
    expect(kinds).toContain("ai");
    expect(recs.find((r) => r.kind === "practice")?.href).toContain("/practice");
    expect(recs.find((r) => r.kind === "ai")?.mentorPrompt).toBeTruthy();
  });

  it("buildLearningRecommendationCards does not link test before lesson", () => {
    const recs = buildLearningRecommendationCards(baseStats(), [
      moduleRow({
        progress: {
          lessonCompleted: false,
          videoCompleted: false,
          testCompleted: false,
          practiceCompleted: false,
          moduleCompleted: false,
        } as ProgressRow,
      }),
    ]);
    expect(recs.some((r) => r.kind === "test")).toBe(false);
    expect(recs.some((r) => r.kind === "lesson")).toBe(true);
  });

  it("buildWeakTopicsRecommendationsView exposes first test href for empty state", () => {
    const view = buildWeakTopicsRecommendationsView(baseStats(), [moduleRow()]);
    expect(view.firstTestHref).toBe("/dashboard/course/m1/test");
    expect(view.weakTopics).toEqual([]);
    expect(view.recommendations.length).toBeGreaterThan(0);
  });

  it("hasWeakTopicsRecommendationsContent is false with no modules and no failures", () => {
    const view = buildWeakTopicsRecommendationsView(baseStats(), []);
    expect(view.recommendations).toEqual([]);
    expect(hasWeakTopicsRecommendationsContent(view.weakTopics, view.recommendations)).toBe(false);
  });

  it("buildRecordedWeakTopics never includes proactive weak-score hint", () => {
    const weak = buildRecordedWeakTopics(
      baseStats({ scoreSuccessPercent: 20, maxPossiblePoints: 100 }),
      [moduleRow()],
    );
    expect(weak.every((w) => w.id !== "weak-score" && w.id !== "upcoming-test")).toBe(true);
  });
});
