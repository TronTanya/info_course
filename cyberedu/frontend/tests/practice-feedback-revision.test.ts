import { describe, expect, it } from "vitest";
import {
  buildPracticeImprovementItems,
  formatStudentPreviousAnswerPreview,
  resolvePracticeCanSubmit,
  resolvePracticeFormAccess,
  resolvePracticeSubmissionCanEdit,
} from "@/lib/practice-feedback-revision-ui";
import type { PracticeViewModel } from "@/types/practice-view-model";

function baseView(
  overrides: Partial<
    Pick<PracticeViewModel, "status" | "canSubmit" | "canRetry" | "submission" | "nextStepsPanel">
  >,
): Pick<PracticeViewModel, "status" | "canSubmit" | "canRetry" | "submission" | "nextStepsPanel"> {
  return {
    status: "in_progress",
    canSubmit: true,
    canRetry: false,
    submission: undefined,
    nextStepsPanel: undefined,
    ...overrides,
  };
}

describe("resolvePracticeCanSubmit", () => {
  it("allows resubmit only when canRetry for needs_retry", () => {
    expect(resolvePracticeCanSubmit("needs_retry", true, true)).toBe(true);
    expect(resolvePracticeCanSubmit("needs_retry", true, false)).toBe(false);
    expect(resolvePracticeCanSubmit("pending_review", true, true)).toBe(false);
    expect(resolvePracticeCanSubmit("approved", true, true)).toBe(false);
  });
});

describe("resolvePracticeFormAccess", () => {
  it("hides form when approved and shows next step", () => {
    const access = resolvePracticeFormAccess(
      baseView({
        status: "approved",
        canSubmit: false,
        submission: { id: "s1", status: "approved" },
        nextStepsPanel: {
          headline: "Тест",
          description: "",
          actions: [{ id: "a", title: "Тест", href: "/test", type: "test", variant: "primary" }],
        },
      }),
      2,
    );
    expect(access.showForm).toBe(false);
    expect(access.showNextStepsPanel).toBe(true);
    expect(access.showAttemptCount).toBe(true);
  });

  it("shows previous answer only when canRetry on needs_retry", () => {
    const on = resolvePracticeFormAccess(
      baseView({
        status: "needs_retry",
        canSubmit: true,
        canRetry: true,
        submission: { id: "s1", status: "needs_retry", feedback: "fix" },
      }),
    );
    expect(on.showPreviousAnswer).toBe(true);
    expect(on.showForm).toBe(true);

    const off = resolvePracticeFormAccess(
      baseView({
        status: "needs_retry",
        canSubmit: false,
        canRetry: false,
        submission: { id: "s1", status: "needs_retry" },
      }),
    );
    expect(off.showPreviousAnswer).toBe(false);
    expect(off.showForm).toBe(false);
  });
});

describe("buildPracticeImprovementItems", () => {
  it("includes sanitized feedback", () => {
    const items = buildPracticeImprovementItems({
      status: "needs_retry",
      feedback: "Добавьте вывод по рискам.",
    });
    expect(items[0]).toMatch(/комментарий/i);
    expect(items.length).toBeGreaterThan(1);
  });
});

describe("formatStudentPreviousAnswerPreview", () => {
  it("detects structured JSON answers", () => {
    expect(
      formatStudentPreviousAnswerPreview('{"checked":["a"],"reflection":"x"}')?.isStructured,
    ).toBe(true);
  });

  it("shows plain text preview", () => {
    expect(formatStudentPreviousAnswerPreview("Мой отчёт по лаборатории")?.preview).toContain(
      "отчёт",
    );
  });

  it("rejects leaked keys", () => {
    expect(formatStudentPreviousAnswerPreview('{"answerKey":"x"}')).toBeNull();
  });
});

describe("resolvePracticeSubmissionCanEdit", () => {
  it("requires canRetry and revision status", () => {
    expect(resolvePracticeSubmissionCanEdit("needs_retry", true)).toBe(true);
    expect(resolvePracticeSubmissionCanEdit("needs_retry", false)).toBe(false);
    expect(resolvePracticeSubmissionCanEdit("pending_review", true)).toBe(false);
  });
});
