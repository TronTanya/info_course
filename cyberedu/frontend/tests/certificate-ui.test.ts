import { describe, expect, it } from "vitest";
import {
  buildCertificateRemainingItems,
  buildCertificateRequirements,
  CERTIFICATE_MIN_SCORE_PERCENT,
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
} satisfies CertificateDashboardState;

describe("certificate-ui", () => {
  it("builds five eligibility requirements including min score", () => {
    const reqs = buildCertificateRequirements(baseState, baseState.stepMetrics, 40, 100);
    expect(reqs).toHaveLength(5);
    expect(reqs.find((r) => r.id === "min_score")?.met).toBe(false);
    expect(CERTIFICATE_MIN_SCORE_PERCENT).toBe(70);
  });

  it("lists remaining modules and steps", () => {
    const reqs = buildCertificateRequirements(baseState, baseState.stepMetrics, 40, 100);
    const remaining = buildCertificateRemainingItems(baseState, reqs);
    expect(remaining.some((r) => r.includes("Модуль 5"))).toBe(true);
  });

  it("marks ready when course completed", () => {
    const done = {
      ...baseState,
      courseCompleted: true,
      canGenerate: true,
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
    const reqs = buildCertificateRequirements(done, done.stepMetrics, 85, 100);
    expect(reqs.every((r) => r.met)).toBe(true);
  });
});
