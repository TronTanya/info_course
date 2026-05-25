import { describe, expect, it } from "vitest";
import {
  buildSubmissionStatusPanelModel,
  sanitizeStudentFeedback,
  SUBMISSION_STATUS_HEADLINES,
  submissionPanelShowsFeedback,
} from "@/lib/submission-status-panel";

describe("SUBMISSION_STATUS_HEADLINES", () => {
  it("uses ETAP 13 copy", () => {
    expect(SUBMISSION_STATUS_HEADLINES.submitted).toBe("Работа отправлена.");
    expect(SUBMISSION_STATUS_HEADLINES.pending_review).toBe(
      "Работа ожидает проверки преподавателем.",
    );
    expect(SUBMISSION_STATUS_HEADLINES.approved).toBe("Работа принята.");
    expect(SUBMISSION_STATUS_HEADLINES.needs_retry).toBe("Нужно доработать.");
    expect(SUBMISSION_STATUS_HEADLINES.rejected).toBe("Работа отклонена.");
    expect(SUBMISSION_STATUS_HEADLINES.locked).toBe("Практика заблокирована.");
  });
});

describe("sanitizeStudentFeedback", () => {
  it("drops admin-only and rubric leaks", () => {
    expect(sanitizeStudentFeedback("Добавьте обоснование по ссылке.")).toBe(
      "Добавьте обоснование по ссылке.",
    );
    expect(sanitizeStudentFeedback("См. hidden rubric и answer key")).toBeUndefined();
    expect(sanitizeStudentFeedback("Внутренние notes для grader")).toBeUndefined();
  });
});

describe("buildSubmissionStatusPanelModel", () => {
  it("shows revise CTA for needs_retry when canRetry", () => {
    const model = buildSubmissionStatusPanelModel({
      status: "needs_retry",
      submission: { feedback: "Уточните вывод." },
      canRetry: true,
    });
    expect(model?.headline).toBe("Нужно доработать.");
    expect(model?.showReviseCta).toBe(true);
    expect(model?.feedback).toBe("Уточните вывод.");
    expect(model?.improvementItems?.length).toBeGreaterThan(0);
  });

  it("hides revise CTA when canRetry false", () => {
    const model = buildSubmissionStatusPanelModel({
      status: "needs_retry",
      submission: {},
      canRetry: false,
    });
    expect(model?.showReviseCta).toBe(false);
  });

  it("shows score only for approved", () => {
    const approved = buildSubmissionStatusPanelModel({
      status: "approved",
      submission: { score: 18, maxScore: 20 },
    });
    expect(approved?.score).toBe(18);
    expect(approved?.maxScore).toBe(20);

    const submitted = buildSubmissionStatusPanelModel({
      status: "submitted",
      submission: { score: 10, maxScore: 20 },
    });
    expect(submitted?.score).toBeUndefined();
  });

  it("hides feedback on pending_review", () => {
    expect(submissionPanelShowsFeedback("pending_review")).toBe(false);
    const model = buildSubmissionStatusPanelModel({
      status: "pending_review",
      submission: { feedback: "секрет до проверки" },
    });
    expect(model?.feedback).toBeUndefined();
  });

  it("returns null for in_progress", () => {
    expect(
      buildSubmissionStatusPanelModel({ status: "in_progress", submission: null }),
    ).toBeNull();
  });

  it("maps locked with reason", () => {
    const model = buildSubmissionStatusPanelModel({
      status: "locked",
      lockedReason: "Сначала сдайте тест модуля.",
    });
    expect(model?.headline).toBe("Практика заблокирована.");
    expect(model?.lockedReason).toContain("тест");
  });
});
