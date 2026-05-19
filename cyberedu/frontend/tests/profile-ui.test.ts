import { describe, expect, it } from "vitest";
import { buildProfileQuickActions, certificateProgressLabel } from "@/lib/profile-ui";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";

const baseStats = {
  courseId: "c1",
  courseTitle: "Кибербезопасность",
  completedModules: 1,
  totalModules: 3,
  progressPercent: 33,
  totalPoints: 10,
  maxPossiblePoints: 30,
  scoreSuccessPercent: 33,
  averageTestPercent: 72,
  testAttemptCount: 2,
  testsPassedCount: 1,
  practicesCompleted: 1,
  practicesTotal: 2,
  completedModuleRows: [{ id: "m1", title: "Модуль 1", orderNumber: 1 }],
  currentModuleTitle: "Модуль 2",
  currentModuleId: "m2",
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
  certificateDisplayState: "unavailable" as const,
} satisfies ProfileCourseStats;

describe("profile-ui", () => {
  it("builds three quick actions including continue and certificate", () => {
    const actions = buildProfileQuickActions(baseStats, [], []);
    expect(actions).toHaveLength(3);
    expect(actions[0]?.id).toBe("continue");
    expect(actions[1]?.href).toBe("/dashboard/certificate");
  });

  it("certificateProgressLabel reflects completion", () => {
    expect(certificateProgressLabel(baseStats)).toBe("1 / 3 модулей");
    expect(
      certificateProgressLabel({ ...baseStats, certificateIssued: true, allModulesComplete: true }),
    ).toBe("Сертификат выдан");
  });
});
