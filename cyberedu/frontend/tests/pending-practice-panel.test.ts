import { describe, expect, it } from "vitest";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import {
  PENDING_PRACTICE_STATUS_LABELS,
  buildPendingPracticePanelItems,
  resolvePendingPracticeStudentFeedback,
} from "@/lib/pending-practice-panel";

function baseStats(over: Partial<ProfileCourseStats> = {}): ProfileCourseStats {
  return {
    courseId: "c1",
    courseTitle: "Курс",
    completedModules: 0,
    totalModules: 1,
    progressPercent: 0,
    totalPoints: 0,
    maxPossiblePoints: 100,
    scoreSuccessPercent: 0,
    averageTestPercent: null,
    testAttemptCount: 0,
    testsPassedCount: 0,
    practicesCompleted: 0,
    practicesTotal: 1,
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
    modulesUntilCertificate: 1,
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

describe("pending-practice-panel", () => {
  it("labels match spec", () => {
    expect(PENDING_PRACTICE_STATUS_LABELS.pending_review).toBe("Ожидает проверки");
    expect(PENDING_PRACTICE_STATUS_LABELS.needs_retry).toBe("Нужно доработать");
    expect(PENDING_PRACTICE_STATUS_LABELS.approved).toBe("Принято");
    expect(PENDING_PRACTICE_STATUS_LABELS.submitted).toBe("Отправлено");
  });

  it("resolvePendingPracticeStudentFeedback strips admin-only leaks", () => {
    expect(
      resolvePendingPracticeStudentFeedback("pending_review", "internal note for grader"),
    ).toBeUndefined();
    expect(
      resolvePendingPracticeStudentFeedback("needs_retry", "Доработайте раздел про пароли."),
    ).toBe("Доработайте раздел про пароли.");
    expect(
      resolvePendingPracticeStudentFeedback("submitted", "should not show"),
    ).toBeUndefined();
    expect(
      resolvePendingPracticeStudentFeedback("approved", "hidden rubric: foo"),
    ).toBeUndefined();
  });

  it("buildPendingPracticePanelItems includes pending and recent approved", () => {
    const now = Date.parse("2026-05-20T12:00:00.000Z");
    const items = buildPendingPracticePanelItems(
      baseStats({
        recentSubmissions: [
          {
            taskTitle: "Лаб 1",
            moduleTitle: "M1",
            moduleId: "m1",
            status: "CHECKING",
            statusLabel: "На проверке",
            outcome: "pending",
            at: "2026-05-19T10:00:00.000Z",
          },
          {
            taskTitle: "Лаб 0",
            moduleTitle: "M0",
            moduleId: "m0",
            status: "ACCEPTED",
            statusLabel: "Принято",
            outcome: "passed",
            at: "2026-05-18T10:00:00.000Z",
            studentFeedback: "Хорошая работа.",
          },
          {
            taskTitle: "Старая",
            moduleTitle: "M9",
            moduleId: "m9",
            status: "ACCEPTED",
            statusLabel: "Принято",
            outcome: "passed",
            at: "2025-01-01T10:00:00.000Z",
          },
        ],
      }),
      now,
    );
    expect(items).toHaveLength(2);
    expect(items[0]?.status).toBe("pending_review");
    expect(items[0]?.statusLabel).toBe("Ожидает проверки");
    expect(items[1]?.status).toBe("approved");
    expect(items[1]?.studentFeedback).toBe("Хорошая работа.");
    expect(items.every((i) => i.href.includes("/practice"))).toBe(true);
  });

  it("returns empty when no qualifying submissions", () => {
    expect(buildPendingPracticePanelItems(baseStats())).toEqual([]);
  });
});
