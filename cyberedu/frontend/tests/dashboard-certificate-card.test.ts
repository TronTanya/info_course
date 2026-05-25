import { describe, expect, it } from "vitest";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";
import {
  DASHBOARD_CERTIFICATE_STATUS_LABELS,
  buildDashboardCertificateCard,
  resolveDashboardCertificateStatus,
} from "@/lib/dashboard-certificate-card";

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

describe("dashboard-certificate-card", () => {
  it("resolveDashboardCertificateStatus mirrors server flags", () => {
    expect(resolveDashboardCertificateStatus(baseStats())).toBe("in_progress");
    expect(
      resolveDashboardCertificateStatus(
        baseStats({ totalModules: 0, progressPercent: 0 }),
      ),
    ).toBe("not_available");
    expect(
      resolveDashboardCertificateStatus(
        baseStats({
          allModulesComplete: true,
          canGenerateCertificate: true,
          completedModules: 2,
        }),
      ),
    ).toBe("ready");
    expect(
      resolveDashboardCertificateStatus(
        baseStats({ certificateIssued: true, canGenerateCertificate: false }),
      ),
    ).toBe("issued");
  });

  it("buildDashboardCertificateCard exposes spec labels and CTAs", () => {
    const inProgress = buildDashboardCertificateCard(
      baseStats({ progressPercent: 40 }),
      [moduleRow({ id: "m1" }), moduleRow({ id: "m2", module: { id: "m2", title: "M2", description: null, orderNumber: 2 } })],
    );
    expect(inProgress.statusLabel).toBe(DASHBOARD_CERTIFICATE_STATUS_LABELS.in_progress);
    expect(inProgress.percentage).toBe(40);
    expect(inProgress.primaryCta.label).toBe("Продолжить курс");
    expect(inProgress.remainingRequirementLabels.length).toBeGreaterThan(0);

    const ready = buildDashboardCertificateCard(
      baseStats({
        allModulesComplete: true,
        canGenerateCertificate: true,
        completedModules: 2,
        progressPercent: 100,
      }),
      [
        moduleRow({ id: "m1", moduleCompleted: true }),
        moduleRow({ id: "m2", moduleCompleted: true, module: { id: "m2", title: "M2", description: null, orderNumber: 2 } }),
      ],
    );
    expect(ready.status).toBe("ready");
    expect(ready.primaryCta.label).toBe("Получить сертификат");

    const issued = buildDashboardCertificateCard(
      baseStats({
        certificateIssued: true,
        certificateNumber: "CE-2026-ABCDEFGH",
        certificateVerifyUrl: "https://app.example/verify/CE-2026-ABC",
        progressPercent: 100,
      }),
      [moduleRow({ id: "m1", moduleCompleted: true })],
    );
    expect(issued.statusLabel).toBe("Получен");
    expect(issued.primaryCta.label).toBe("Открыть сертификат");
    expect(issued.headline).toBe("Сертификат получен");
    expect(issued.verifyCta?.href).toBe("https://app.example/verify/CE-2026-ABC");
    expect(issued.verifyCta?.external).toBe(true);
    expect(JSON.stringify(issued)).not.toMatch(/verificationCode/i);
  });
});
