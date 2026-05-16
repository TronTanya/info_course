import { describe, expect, it } from "vitest";
import { parseReviewSubmissionScore } from "@/lib/submission-review-score";

describe("parseReviewSubmissionScore", () => {
  it("ACCEPTED: требует балл и не даёт больше maxScore", () => {
    expect(parseReviewSubmissionScore("ACCEPTED", "", 10).ok).toBe(false);
    expect(parseReviewSubmissionScore("ACCEPTED", "11", 10).ok).toBe(false);
    expect(parseReviewSubmissionScore("ACCEPTED", "-1", 10).ok).toBe(false);
    expect(parseReviewSubmissionScore("ACCEPTED", "10", 10)).toEqual({ ok: true, score: 10 });
  });

  it("REJECTED: балл необязателен", () => {
    expect(parseReviewSubmissionScore("REJECTED", "", 10)).toEqual({ ok: true, score: null });
  });

  it("REJECTED: опциональный валидный балл сохраняется", () => {
    expect(parseReviewSubmissionScore("REJECTED", "5", 10)).toEqual({ ok: true, score: 5 });
  });

  it("REJECTED: слишком большой балл игнорируется (null)", () => {
    expect(parseReviewSubmissionScore("REJECTED", "99", 10)).toEqual({ ok: true, score: null });
  });

  it("недопустимый статус — ошибка", () => {
    expect(parseReviewSubmissionScore("DRAFT", "5", 10).ok).toBe(false);
  });
});
