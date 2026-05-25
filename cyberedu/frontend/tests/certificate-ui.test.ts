import { describe, expect, it } from "vitest";
import {
  buildCertificateRemainingItems,
  buildCertificateRequirements,
} from "@/lib/certificate-ui";
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
  certificate: null,
  pdfInfrastructureReady: true,
} satisfies CertificateDashboardState;

describe("certificate-ui", () => {
  it("builds four eligibility requirements (aligned with server)", () => {
    const reqs = buildCertificateRequirements(baseState, baseState.stepMetrics);
    expect(reqs).toHaveLength(4);
    expect(reqs.find((r) => r.id === "modules")?.met).toBe(false);
  });

  it("lists remaining modules and steps", () => {
    const reqs = buildCertificateRequirements(baseState, baseState.stepMetrics);
    const remaining = buildCertificateRemainingItems(baseState, reqs);
    expect(remaining.some((r) => r.includes("Модуль 5"))).toBe(true);
  });

  it("marks all requirements met when course completed", () => {
    const done = {
      ...baseState,
      courseCompleted: true,
      canGenerate: true,
      lifecyclePhase: "ready_to_issue" as const,
      userFlow: "ready" as const,
      progressPercent: 100,
      completedModules: 8,
      totalModules: 8,
      incompleteModules: [],
      stepMetrics: {
        lessonsDone: 8,
        lessonsTotal: 8,
        testsDone: 8,
        testsTotal: 8,
        practiceDone: 8,
        practiceTotal: 8,
      },
      scoreSuccessPercent: 85,
    };
    const reqs = buildCertificateRequirements(done, done.stepMetrics);
    expect(reqs.every((r) => r.met)).toBe(true);
  });
});
