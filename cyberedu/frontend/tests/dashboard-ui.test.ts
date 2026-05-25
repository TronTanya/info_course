import { describe, expect, it } from "vitest";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";
import {
  buildAiRecommendation,
  buildContinueLearningCard,
  buildDashboardWelcomeGreeting,
  buildRecentActivities,
  buildRoadmapPreviewModules,
  buildUpcomingTasks,
  buildWeakTopicRecommendations,
  buildWelcomeMotivation,
  computeStepMetrics,
  countPendingTasks,
  formatDashboardLastActivity,
  getActiveModuleSnapshot,
  getCertificateEligibility,
  getContinueFromModules,
  getContinueTarget,
  getDashboardWelcomeCourseStatus,
  getCoursePositionLabel,
  getLastTestResultView,
  getNextLessonCard,
  getNextPracticeCard,
  getNextTestCard,
  getPendingPracticeReviews,
  getQuickActionHrefs,
  resolveActiveModuleRow,
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
    recentTests: over.recentTests ?? [],
    recentSubmissions: over.recentSubmissions ?? [],
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

  it("buildDashboardWelcomeGreeting uses name or CyberEdu fallback", () => {
    expect(buildDashboardWelcomeGreeting("Анна")).toBe("Добро пожаловать, Анна");
    expect(buildDashboardWelcomeGreeting("студент")).toBe("Добро пожаловать в CyberEdu");
    expect(buildDashboardWelcomeGreeting("")).toBe("Добро пожаловать в CyberEdu");
  });

  it("getDashboardWelcomeCourseStatus maps progress to four labels", () => {
    expect(getDashboardWelcomeCourseStatus(baseStats())).toBe("started");
    expect(
      getDashboardWelcomeCourseStatus(baseStats({ completedModules: 1, progressPercent: 25 })),
    ).toBe("in_progress");
    expect(
      getDashboardWelcomeCourseStatus(
        baseStats({ progressPercent: 80, modulesUntilCertificate: 1, totalModules: 10, completedModules: 9 }),
      ),
    ).toBe("almost_done");
    expect(
      getDashboardWelcomeCourseStatus(
        baseStats({ allModulesComplete: true, canGenerateCertificate: true }),
      ),
    ).toBe("certificate_ready");
    expect(
      getDashboardWelcomeCourseStatus(baseStats({ certificateIssued: true, allModulesComplete: true })),
    ).toBe("certificate_ready");
  });

  it("getNextLessonCard returns upcoming lesson href", () => {
    const card = getNextLessonCard([moduleRow({ id: "m1" })]);
    expect(card?.kind).toBe("lesson");
    expect(card?.href).toContain("/lesson");
    expect(card?.empty).toBeFalsy();
  });

  it("getNextTestCard returns test href when lesson done", () => {
    const card = getNextTestCard([
      moduleRow({
        id: "m1",
        progress: {
          lessonCompleted: true,
          videoCompleted: false,
          testCompleted: false,
          practiceCompleted: false,
          moduleCompleted: false,
        } as ProgressRow,
      }),
    ]);
    expect(card?.kind).toBe("test");
    expect(card?.href).toContain("/test");
    expect(card?.empty).toBeFalsy();
  });

  it("getNextTestCard marks empty when lesson not done", () => {
    const card = getNextTestCard([moduleRow({ id: "m1" })]);
    expect(card?.kind).toBe("test");
    expect(card?.empty).toBe(true);
    expect(card?.href).toContain("/lesson");
  });

  it("getNextPracticeCard falls back to test when no practice queue", () => {
    const card = getNextPracticeCard([
      moduleRow({
        id: "m1",
        requirements: { lessonRequired: true, videoRequired: false, testRequired: true, practiceRequired: false, totalSteps: 2 },
        progress: {
          lessonCompleted: true,
          videoCompleted: false,
          testCompleted: false,
          practiceCompleted: false,
          moduleCompleted: false,
        } as ProgressRow,
      }),
    ]);
    expect(card?.kind).toBe("test");
    expect(card?.href).toContain("/test");
  });

  it("buildWeakTopicRecommendations includes failed last test", () => {
    const items = buildWeakTopicRecommendations(
      baseStats({
        lastTest: {
          testTitle: "Контроль 1",
          moduleTitle: "Module m1",
          passed: false,
          percent: 40,
          at: "2026-05-01T00:00:00.000Z",
        },
      }),
      [moduleRow({ id: "m1", module: { id: "m1", title: "Module m1", description: null, orderNumber: 1 } })],
    );
    expect(items.some((i) => i.id === "weak-test")).toBe(true);
  });

  it("countPendingTasks matches upcoming queue length", () => {
    expect(countPendingTasks([moduleRow({ id: "m1" })])).toBe(1);
  });

  it("getQuickActionHrefs resolves course, practice and mentor links", () => {
    const hrefs = getQuickActionHrefs(
      [moduleRow({ id: "m1" })],
      baseStats({ currentModuleId: "m1" }),
    );
    expect(hrefs.course).toBe("/dashboard/course");
    expect(hrefs.profile).toBe("/dashboard/profile");
    expect(hrefs.mentor).toBe("/dashboard/mentor");
    expect(hrefs.practice).toContain("/practice");
  });

  it("getLastTestResultView returns review items for failed test", () => {
    const view = getLastTestResultView(
      baseStats({
        lastTest: {
          testTitle: "Контроль 1",
          moduleTitle: "Module m1",
          passed: false,
          percent: 40,
          at: "2026-05-01T00:00:00.000Z",
        },
      }),
      [moduleRow({ id: "m1", module: { id: "m1", title: "Module m1", description: null, orderNumber: 1 } })],
    );
    expect(view?.percent).toBe(40);
    expect(view?.reviewItems.length).toBeGreaterThan(0);
    expect(view?.href).toContain("/test");
  });

  it("getNextPracticeCard includes difficulty from module order", () => {
    const card = getNextPracticeCard([moduleRow({ id: "m1", module: { id: "m1", title: "M1", description: null, orderNumber: 1 } })]);
    expect(card?.difficultyLabel).toBe("Начальный");
  });

  it("getCertificateEligibility lists module requirement", () => {
    const eligibility = getCertificateEligibility(baseStats(), computeStepMetrics([]));
    expect(eligibility.requirements.some((r) => r.label.includes("Модули"))).toBe(true);
  });

  it("buildAiRecommendation points to mentor page", () => {
    const rec = buildAiRecommendation(baseStats({ currentModuleId: "m1" }), [moduleRow({ id: "m1" })]);
    expect(rec.mentorHref).toBe("/dashboard/mentor");
    expect(rec.actionLabel).toBe("Спросить AI");
  });

  it("getCoursePositionLabel shows module index", () => {
    const label = getCoursePositionLabel(baseStats({ totalModules: 5 }), [moduleRow({ id: "m1" })]);
    expect(label).toContain("Модуль 1");
  });

  it("buildContinueLearningCard surfaces next lesson step", () => {
    const card = buildContinueLearningCard(baseStats(), [moduleRow({ id: "m1" })]);
    expect(card.kind).toBe("lesson");
    expect(card.ctaLabel).toBe("Продолжить урок");
    expect(card.statusLabel).toBe("Лекция");
    expect(card.href).toContain("/lesson");
  });

  it("buildContinueLearningCard points to test after lesson", () => {
    const card = buildContinueLearningCard(baseStats(), [
      moduleRow({
        id: "m1",
        progress: {
          lessonCompleted: true,
          videoCompleted: false,
          testCompleted: false,
          practiceCompleted: false,
          moduleCompleted: false,
        } as ProgressRow,
      }),
    ]);
    expect(card.kind).toBe("test");
    expect(card.ctaLabel).toBe("Пройти тест");
    expect(card.href).toContain("/test");
  });

  it("buildContinueLearningCard surfaces practice retry when pipeline steps are done", () => {
    const card = buildContinueLearningCard(
      baseStats({
        currentModuleId: null,
        lastPractice: {
          taskTitle: "Лаб 1",
          moduleTitle: "Module m1",
          status: "NEEDS_REVISION",
          statusLabel: "На доработку",
          at: "2026-05-01T00:00:00.000Z",
        },
      }),
      [
        moduleRow({
          id: "m1",
          moduleCompleted: true,
          practiceNeedsRevision: true,
          progress: {
            lessonCompleted: true,
            videoCompleted: false,
            testCompleted: true,
            practiceCompleted: false,
            moduleCompleted: true,
          } as ProgressRow,
          requirements: {
            lessonRequired: true,
            videoRequired: false,
            testRequired: true,
            practiceRequired: false,
            totalSteps: 2,
          },
        }),
        moduleRow({ id: "m2", unlocked: false }),
      ],
    );
    expect(card.kind).toBe("practice");
    expect(card.statusLabel).toBe("На доработку");
    expect(card.href).toContain("/m1/practice");
  });

  it("buildContinueLearningCard empty state when no unlocked modules", () => {
    const card = buildContinueLearningCard(baseStats(), [
      moduleRow({ id: "m1", unlocked: false }),
    ]);
    expect(card.empty).toBe(true);
    expect(card.title).toMatch(/первого модуля/i);
    expect(card.ctaLabel).toBe("Открыть курс");
    expect(card.href).toBe("/dashboard/course");
  });

  it("buildContinueLearningCard points to certificate when course done", () => {
    const card = buildContinueLearningCard(
      baseStats({ allModulesComplete: true, completedModules: 1, totalModules: 1, canGenerateCertificate: true }),
      [moduleRow({ id: "m1", moduleCompleted: true })],
    );
    expect(card.kind).toBe("certificate");
    expect(card.href).toBe("/dashboard/certificate");
    expect(card.ctaLabel).toBe("Получить сертификат");
  });

  it("buildRoadmapPreviewModules returns up to five modules", () => {
    const rows = [
      moduleRow({ id: "m1", module: { id: "m1", title: "A", description: null, orderNumber: 1 } }),
      moduleRow({ id: "m2", module: { id: "m2", title: "B", description: null, orderNumber: 2 } }),
      moduleRow({ id: "m3", module: { id: "m3", title: "C", description: null, orderNumber: 3 } }),
    ];
    const preview = buildRoadmapPreviewModules(rows, "m2", 5);
    expect(preview.length).toBeGreaterThan(0);
    expect(preview.length).toBeLessThanOrEqual(5);
    expect(preview.some((m) => m.isCurrent)).toBe(true);
  });

  it("buildWelcomeMotivation reflects certificate finish", () => {
    expect(buildWelcomeMotivation(baseStats({ allModulesComplete: true, certificateIssued: true }))).toMatch(
      /сертификат/i,
    );
  });

  it("formatDashboardLastActivity uses summary timestamp", () => {
    const formatted = formatDashboardLastActivity(
      baseStats({
        lastActivitySummary: {
          kind: "lesson",
          label: "Лекция",
          detail: "Урок 1",
          at: "2026-05-10T12:00:00.000Z",
        },
      }),
    );
    expect(formatted).toContain("10");
    expect(formatted).not.toBeNull();
  });

  it("resolveActiveModuleRow prefers current module when unlocked", () => {
    const row = resolveActiveModuleRow(
      baseStats({ currentModuleId: "m2", allModulesComplete: false }),
      [
        moduleRow({ id: "m1" }),
        moduleRow({ id: "m2", module: { id: "m2", title: "M2", description: null, orderNumber: 2 } }),
      ],
    );
    expect(row?.module.id).toBe("m2");
  });

  it("getActiveModuleSnapshot marks first incomplete step as current", () => {
    const snapshot = getActiveModuleSnapshot(baseStats({ currentModuleId: "m1" }), [moduleRow({ id: "m1" })]);
    expect(snapshot?.title).toContain("Module");
    expect(snapshot?.steps.find((s) => s.kind === "lesson")?.state).toBe("current");
    expect(snapshot?.steps.find((s) => s.kind === "test")?.state).toBe("locked");
  });

  it("getPendingPracticeReviews lists only pending outcomes", () => {
    const items = getPendingPracticeReviews(
      baseStats({
        recentSubmissions: [
          {
            taskTitle: "Лаб 1",
            moduleTitle: "M1",
            moduleId: "m1",
            status: "CHECKING",
            statusLabel: "На проверке",
            outcome: "pending",
            at: "2026-05-01T00:00:00.000Z",
          },
          {
            taskTitle: "Лаб 2",
            moduleTitle: "M1",
            moduleId: "m1",
            status: "ACCEPTED",
            statusLabel: "Принято",
            outcome: "passed",
            at: "2026-05-02T00:00:00.000Z",
          },
        ],
      }),
      [moduleRow({ id: "m1", unlocked: true })],
    );
    expect(items).toHaveLength(1);
    expect(items[0]?.statusLabel).toBe("На проверке");
    expect(items[0]?.href).toBe("/dashboard/course/m1/practice");
  });
});
