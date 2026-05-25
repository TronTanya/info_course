import { describe, expect, it } from "vitest";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";
import {
  CERTIFICATE_PROGRESS_CARD_TITLE,
  buildCertificateProgressCardModel,
  resolveDashboardCertificateStatus,
} from "@/lib/certificate-progress-card";

function moduleRow(over: Partial<CourseProgressModuleRow> & { id?: string }): CourseProgressModuleRow {
  const id = over.id ?? "m1";
  return {
    module: { id, title: `Module ${id}`, description: null, orderNumber: over.module?.orderNumber ?? 1 },
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: true,
      practiceRequired: true,
      totalSteps: 3,
      ...over.requirements,
    },
    contentCounts: { lessons: 1, tests: 1, practices: 1, ...over.contentCounts },
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
    progressPercent: 25,
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

describe("certificate-progress-card", () => {
  it("resolveDashboardCertificateStatus mirrors server flags only", () => {
    expect(resolveDashboardCertificateStatus(baseStats())).toBe("in_progress");
    expect(resolveDashboardCertificateStatus(baseStats({ totalModules: 0 }))).toBe("not_available");
    expect(
      resolveDashboardCertificateStatus(
        baseStats({ allModulesComplete: true, canGenerateCertificate: true, completedModules: 2 }),
      ),
    ).toBe("ready");
    expect(resolveDashboardCertificateStatus(baseStats({ certificateIssued: true }))).toBe("issued");
  });

  it("in_progress: headline, progress, continue CTA, requirement labels", () => {
    const model = buildCertificateProgressCardModel(
      baseStats({ progressPercent: 40, modulesUntilCertificate: 2 }),
      [moduleRow({ id: "m1" }), moduleRow({ id: "m2", module: { id: "m2", title: "M2", description: null, orderNumber: 2 } })],
    );
    expect(model.title).toBe(CERTIFICATE_PROGRESS_CARD_TITLE);
    expect(model.status).toBe("in_progress");
    expect(model.headline).toBe("До сертификата осталось…");
    expect(model.percentage).toBe(40);
    expect(model.primaryCta.label).toBe("Продолжить курс");
    expect(model.remainingRequirements.length).toBeGreaterThan(0);
    const labels = [...model.completedRequirements, ...model.remainingRequirements].map((r) => r.label);
    expect(labels.some((l) => l.includes("лекци"))).toBe(true);
    expect(labels.some((l) => l.includes("тест"))).toBe(true);
    expect(labels.some((l) => l.includes("практик"))).toBe(true);
  });

  it("ready: all conditions met CTA", () => {
    const model = buildCertificateProgressCardModel(
      baseStats({
        allModulesComplete: true,
        canGenerateCertificate: true,
        completedModules: 2,
        progressPercent: 100,
        modulesUntilCertificate: 0,
      }),
      [
        moduleRow({
          id: "m1",
          moduleCompleted: true,
          progress: {
            lessonCompleted: true,
            testCompleted: true,
            practiceCompleted: true,
            moduleCompleted: true,
          } as ProgressRow,
        }),
        moduleRow({
          id: "m2",
          moduleCompleted: true,
          module: { id: "m2", title: "M2", description: null, orderNumber: 2 },
          progress: {
            lessonCompleted: true,
            testCompleted: true,
            practiceCompleted: true,
            moduleCompleted: true,
          } as ProgressRow,
        }),
      ],
    );
    expect(model.status).toBe("ready");
    expect(model.headline).toBe("Все условия выполнены");
    expect(model.primaryCta.label).toBe("Получить сертификат");
    expect(model.remainingRequirements).toHaveLength(0);
  });

  it("issued: open certificate CTA and verify secondary", () => {
    const model = buildCertificateProgressCardModel(
      baseStats({
        certificateIssued: true,
        certificateNumber: "CE-2026-TEST",
        certificateVerifyUrl: "https://example.com/verify/CE-2026-ABC",
        progressPercent: 100,
        allModulesComplete: true,
        completedModules: 2,
      }),
      [moduleRow({ id: "m1", moduleCompleted: true })],
    );
    expect(model.headline).toBe("Сертификат получен");
    expect(model.primaryCta.label).toBe("Открыть сертификат");
    expect(model.secondaryCta?.label).toBe("Проверить сертификат");
    expect(JSON.stringify(model)).not.toMatch(/verificationCode/i);
  });

  it("not_available: explains empty program", () => {
    const model = buildCertificateProgressCardModel(baseStats({ totalModules: 0, progressPercent: 0 }), []);
    expect(model.status).toBe("not_available");
    expect(model.headline).toBe("Сертификат пока недоступен");
    expect(model.description).toContain("модул");
  });
});
