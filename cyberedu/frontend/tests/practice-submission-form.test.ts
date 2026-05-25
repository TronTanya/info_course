import { describe, expect, it } from "vitest";
import {
  buildLogAnalysisConclusion,
  buildUrlAnalysisExplanation,
  isPracticeSubmissionDisabled,
  resolvePracticeSubmissionAnswerKind,
  validateChecklistAnswer,
  validateTextAnswer,
  validateUrlAnalysisReport,
} from "@/lib/practice-submission-form";

describe("resolvePracticeSubmissionAnswerKind", () => {
  it("maps task types to answer kinds", () => {
    expect(resolvePracticeSubmissionAnswerKind("TEXT_ANSWER")).toBe("text");
    expect(resolvePracticeSubmissionAnswerKind("CHECKLIST")).toBe("checklist");
    expect(resolvePracticeSubmissionAnswerKind("URL_ANALYSIS")).toBe("url_analysis");
    expect(resolvePracticeSubmissionAnswerKind("LOG_ANALYSIS")).toBe("log_analysis");
    expect(resolvePracticeSubmissionAnswerKind("FILE_UPLOAD")).toBe("file_upload");
    expect(resolvePracticeSubmissionAnswerKind("PHISHING_ANALYSIS")).toBe("scenario");
  });
});

describe("isPracticeSubmissionDisabled", () => {
  it("follows canSubmit from view model rules", () => {
    expect(isPracticeSubmissionDisabled("approved", false)).toBe(true);
    expect(isPracticeSubmissionDisabled("pending_review", false)).toBe(true);
    expect(isPracticeSubmissionDisabled("in_progress", true)).toBe(false);
    expect(isPracticeSubmissionDisabled("needs_retry", false)).toBe(true);
    expect(isPracticeSubmissionDisabled("needs_retry", true)).toBe(false);
  });
});

describe("validateTextAnswer", () => {
  it("enforces min length", () => {
    expect(validateTextAnswer("short", 10)).toMatch(/10/);
    expect(validateTextAnswer("long enough text", 10)).toBeNull();
  });
});

describe("validateChecklistAnswer", () => {
  it("requires all items and reflection", () => {
    expect(validateChecklistAnswer(["a"], "", 40, 2)).toMatch(/чек-лист/);
    expect(validateChecklistAnswer(["a", "b"], "x".repeat(40), 40, 2)).toBeNull();
  });
});

describe("url and log report builders", () => {
  it("builds combined explanation without leaking keys", () => {
    const text = buildUrlAnalysisExplanation({
      suspiciousSigns: "http без s",
      risk: "высокий",
      explanation: "домен похож на оригинал",
      safeActions: "не переходить",
    });
    expect(text).toContain("Подозрительные признаки");
    expect(text).not.toMatch(/answerKey|solution/i);
    expect(validateUrlAnalysisReport({
      suspiciousSigns: "a",
      risk: "b",
      explanation: "c".repeat(40),
      safeActions: "d",
    })).toBeNull();
  });

  it("builds log conclusion from sections", () => {
    const c = buildLogAnalysisConclusion({
      suspiciousEvents: "много LOGIN_FAILED",
      possibleCause: "brute_force",
      recommendation: "заблокировать учётку",
    });
    expect(c).toContain("Подозрительные события");
    expect(c.length).toBeGreaterThan(50);
  });
});
