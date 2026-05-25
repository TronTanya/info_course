import { describe, expect, it } from "vitest";
import {
  buildCertificateRequirementRows,
  buildCertificateRemainingItems,
  resolveCertificateLifecyclePhase,
  CERTIFICATE_ELIGIBILITY_RULE,
} from "@/lib/certificate-eligibility";
import type { CertificateDashboardState } from "@/lib/certificate";

const baseState = {
  courseId: "c1",
  courseTitle: "Кибербезопасность",
  courseHours: 120,
  progressPercent: 50,
  completedModules: 4,
  totalModules: 8,
  incompleteModules: [{ id: "m5", title: "Модуль 5" }],
  courseCompleted: false,
  canGenerate: false,
  lifecyclePhase: "in_progress" as const,
  userFlow: "progress" as const,
  studentDisplayName: "Иванов Иван",
  stepMetrics: {
    lessonsDone: 4,
    lessonsTotal: 8,
    testsDone: 3,
    testsTotal: 8,
    practiceDone: 2,
    practiceTotal: 8,
  },
  totalPoints: 40,
  maxPossiblePoints: 100,
  scoreSuccessPercent: 40,
  pdfInfrastructureReady: true,
  certificate: null,
} satisfies CertificateDashboardState;

describe("certificate-eligibility", () => {
  it("documents server-aligned rule text", () => {
    expect(CERTIFICATE_ELIGIBILITY_RULE).toContain("модул");
  });

  it("builds four blocking-aligned requirement rows", () => {
    const reqs = buildCertificateRequirementRows({
      completedModules: baseState.completedModules,
      totalModules: baseState.totalModules,
      courseCompleted: baseState.courseCompleted,
      metrics: baseState.stepMetrics,
    });
    expect(reqs).toHaveLength(4);
    expect(reqs.find((r) => r.id === "modules")?.met).toBe(false);
  });

  it("resolves lifecycle from server flags", () => {
    expect(
      resolveCertificateLifecyclePhase({
        certificate: null,
        canGenerate: false,
        completedModules: 0,
        totalModules: 8,
      }),
    ).toBe("not_started");

    expect(
      resolveCertificateLifecyclePhase({
        certificate: null,
        canGenerate: true,
        completedModules: 8,
        totalModules: 8,
      }),
    ).toBe("ready_to_issue");

    expect(
      resolveCertificateLifecyclePhase({
        certificate: {
          id: "x",
          certificateNumber: "CE",
          issuedAt: "",
          verifyUrl: "/",
          qrDataUrl: "",
          registryStatus: "active" as const,
          pdfReady: true,
        },
        canGenerate: true,
        completedModules: 8,
        totalModules: 8,
      }),
    ).toBe("issued");
  });

  it("lists remaining modules in hints", () => {
    const reqs = buildCertificateRequirementRows({
      completedModules: baseState.completedModules,
      totalModules: baseState.totalModules,
      courseCompleted: baseState.courseCompleted,
      metrics: baseState.stepMetrics,
    });
    const remaining = buildCertificateRemainingItems(baseState, reqs);
    expect(remaining.some((r) => r.includes("Модуль 5"))).toBe(true);
  });
});
