import { describe, expect, it } from "vitest";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";
import {
  buildCoursePageCertificateSummary,
  buildCoursePageSummary,
  COURSE_PAGE_BADGE,
} from "@/lib/course-page-summary";

function mockProgress(over: Partial<ProgressRow> = {}): ProgressRow {
  return {
    id: "p1",
    userId: "u1",
    moduleId: "m1",
    lessonCompleted: false,
    videoCompleted: false,
    testCompleted: false,
    practiceCompleted: false,
    moduleCompleted: false,
    score: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  };
}

function moduleRow(over: Partial<CourseProgressModuleRow> = {}): CourseProgressModuleRow {
  const { module, requirements, contentCounts, progress, ...rest } = over;
  return {
    module: { id: "m1", title: "Модуль 1", description: null, orderNumber: 1, ...module },
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: true,
      practiceRequired: true,
      totalSteps: 3,
      ...requirements,
    },
    contentCounts: { lessons: 1, tests: 1, practices: 1, ...contentCounts },
    progress: progress === undefined ? mockProgress() : progress,
    unlocked: rest.unlocked ?? true,
    progressPercent: rest.progressPercent ?? 0,
    score: rest.score ?? 0,
    moduleCompleted: rest.moduleCompleted ?? false,
    ...rest,
  };
}

describe("buildCoursePageCertificateSummary", () => {
  it("reports remaining conditions when track is incomplete", () => {
    const metrics = {
      lessonsDone: 0,
      lessonsTotal: 1,
      testsDone: 0,
      testsTotal: 1,
      practiceDone: 0,
      practiceTotal: 1,
    };
    const summary = buildCoursePageCertificateSummary([moduleRow()], metrics, null);
    expect(summary.ready).toBe(false);
    expect(summary.remainingConditions).toBe(4);
    expect(summary.cta.label).toBe("Посмотреть условия сертификата");
  });

  it("marks ready when all requirements are met", () => {
    const row = moduleRow({
      moduleCompleted: true,
      progress: mockProgress({
        lessonCompleted: true,
        testCompleted: true,
        practiceCompleted: true,
        moduleCompleted: true,
      }),
    });
    const metrics = {
      lessonsDone: 1,
      lessonsTotal: 1,
      testsDone: 1,
      testsTotal: 1,
      practiceDone: 1,
      practiceTotal: 1,
    };
    const summary = buildCoursePageCertificateSummary([row], metrics, { certificate: null, canGenerate: true });
    expect(summary.ready).toBe(true);
    expect(summary.remainingConditions).toBe(0);
    expect(summary.cta.label).toBe("К сертификату");
  });

  it("marks issued when certificate exists", () => {
    const summary = buildCoursePageCertificateSummary(
      [moduleRow({ moduleCompleted: true })],
      { lessonsDone: 1, lessonsTotal: 1, testsDone: 1, testsTotal: 1, practiceDone: 1, practiceTotal: 1 },
      {
        certificate: {
          id: "c1",
          certificateNumber: "CE-2026-TEST",
          issuedAt: new Date().toISOString(),
          verifyUrl: "/verify/abc",
          qrDataUrl: "data:image/png;base64,xx",
          registryStatus: "active",
          pdfReady: true,
        },
        canGenerate: true,
      },
    );
    expect(summary.issued).toBe(true);
    expect(summary.statusLabel).toBe("Выдан");
  });
});

describe("buildCoursePageSummary", () => {
  it("uses course badge and description", () => {
    const summary = buildCoursePageSummary(
      {
        course: { id: "c1", title: "Основы ИБ", description: "Краткое описание" },
        overallProgressPercent: 25,
        totalScore: 10,
        modules: [moduleRow()],
      },
      null,
    );
    expect(summary.badge).toBe(COURSE_PAGE_BADGE);
    expect(summary.title).toBe("Основы ИБ");
    expect(summary.subtitle).toBe("Краткое описание");
    expect(summary.progressPercent).toBe(25);
    expect(summary.continue.label).toBe("Продолжить обучение");
  });
});
