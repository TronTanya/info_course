import { describe, expect, it } from "vitest";
import {
  checkAutoPracticeTextAnswer,
  resolveCombinedSubmission,
  resolveInlineApiPracticeSave,
  resolveStructuredSubmission,
  resolveTextAnswerSubmission,
} from "@/lib/practice-progress-engine";

describe("resolveTextAnswerSubmission", () => {
  it("MANUAL всегда SUBMITTED", () => {
    const p = resolveTextAnswerSubmission("MANUAL", "любой длинный текст достаточной длины", 10, null);
    expect(p.kind).toBe("save");
    if (p.kind === "save") {
      expect(p.status).toBe("SUBMITTED");
      expect(p.score).toBeNull();
    }
  });

  it("AUTO требует шаблон и принимает при совпадении", () => {
    const bad = resolveTextAnswerSubmission("AUTO", "hello", 10, "foo");
    expect(bad.kind).toBe("reject");
    const ok = resolveTextAnswerSubmission("AUTO", "hello world", 10, "world");
    expect(ok.kind).toBe("save");
    if (ok.kind === "save") {
      expect(ok.status).toBe("ACCEPTED");
      expect(ok.score).toBe(10);
    }
  });

  it("MIXED при успешной авто-части оставляет SUBMITTED", () => {
    const p = resolveTextAnswerSubmission("MIXED", "test answer here", 10, "answer");
    expect(p.kind).toBe("save");
    if (p.kind === "save") {
      expect(p.status).toBe("SUBMITTED");
      expect(p.pendingReview).toBe(true);
    }
  });
});

describe("resolveStructuredSubmission", () => {
  it("AUTO + accept → ACCEPTED", () => {
    const r = resolveStructuredSubmission("AUTO", { decision: "accept", textAnswer: "{}" }, 8);
    expect(r.kind).toBe("save");
    if (r.kind === "save") {
      expect(r.status).toBe("ACCEPTED");
      expect(r.score).toBe(8);
    }
  });

  it("AUTO + submit → SUBMITTED с pendingReview", () => {
    const r = resolveStructuredSubmission("AUTO", { decision: "submit", textAnswer: "{}" }, 8);
    expect(r.kind).toBe("save");
    if (r.kind === "save") {
      expect(r.status).toBe("SUBMITTED");
      expect(r.pendingReview).toBe(true);
    }
  });

  it("MIXED + accept → SUBMITTED", () => {
    const r = resolveStructuredSubmission("MIXED", { decision: "accept", textAnswer: "{}" }, 8);
    expect(r.kind).toBe("save");
    if (r.kind === "save") {
      expect(r.status).toBe("SUBMITTED");
    }
  });
});

describe("resolveInlineApiPracticeSave", () => {
  it("AUTO при успехе даёт ACCEPTED", () => {
    const r = resolveInlineApiPracticeSave("AUTO", true, 7);
    expect(r.save).toBe(true);
    if (r.save) {
      expect(r.status).toBe("ACCEPTED");
      expect(r.score).toBe(7);
    }
  });

  it("MIXED при успехе даёт SUBMITTED", () => {
    const r = resolveInlineApiPracticeSave("MIXED", true, 7);
    expect(r.save).toBe(true);
    if (r.save) expect(r.status).toBe("SUBMITTED");
  });
});

describe("resolveCombinedSubmission", () => {
  it("AUTO + шаблон → ACCEPTED", () => {
    const r = resolveCombinedSubmission("AUTO", "my answer text", 5, "answer");
    expect(r.kind).toBe("save");
    if (r.kind === "save") expect(r.status).toBe("ACCEPTED");
  });
});

describe("checkAutoPracticeTextAnswer", () => {
  it("отклоняет при отсутствии шаблона", () => {
    const r = checkAutoPracticeTextAnswer(null, "x", 10);
    expect(r.ok).toBe(false);
  });
});
