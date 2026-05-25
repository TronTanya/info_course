import { describe, expect, it } from "vitest";
import {
  buildPracticeStructuredSubmitPayload,
  buildPracticeTextSubmitPayload,
  FORBIDDEN_PRACTICE_SUBMIT_CLIENT_KEYS,
  parsePracticeSubmitApiResponse,
  stripForbiddenPracticeSubmitFields,
} from "@/lib/practice-submission-client";
import { mapRowToPracticeSubmissionView } from "@/lib/practice-submission-view";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd());

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

describe("practice submission client contract", () => {
  it("strips forbidden keys from client payload", () => {
    const out = stripForbiddenPracticeSubmitFields({
      moduleId: "mod_abc12345",
      practicalTaskId: "task_abc12345",
      text: "ответ студента",
      solution: "secret",
      answerKey: "all-flags",
      status: "ACCEPTED",
    });
    expect(out).toEqual({
      moduleId: "mod_abc12345",
      practicalTaskId: "task_abc12345",
      text: "ответ студента",
    });
    expect(FORBIDDEN_PRACTICE_SUBMIT_CLIENT_KEYS).toContain("scenarioData");
  });

  it("buildPracticeTextSubmitPayload keeps only allowed fields", () => {
    const p = buildPracticeTextSubmitPayload({
      moduleId: " m1 ",
      practicalTaskId: " t1 ",
      text: "  hello world  ",
      expectedCommand: "ping evil",
    } as Parameters<typeof buildPracticeTextSubmitPayload>[0] & { expectedCommand: string });
    expect(p).toEqual({ moduleId: "m1", practicalTaskId: "t1", text: "hello world" });
  });

  it("buildPracticeStructuredSubmitPayload trims payload", () => {
    const p = buildPracticeStructuredSubmitPayload({
      moduleId: "m1",
      practicalTaskId: "t1",
      payload: '{"checked":["a"]}',
    });
    expect(p.payload).toBe('{"checked":["a"]}');
  });

  it("parsePracticeSubmitApiResponse accepts safe submission view", () => {
    const parsed = parsePracticeSubmitApiResponse({
      ok: true,
      submission: {
        id: "sub1",
        status: "submitted",
        submittedAt: "2026-01-01T00:00:00.000Z",
        maxScore: 20,
      },
    });
    expect(parsed).toEqual({
      ok: true,
      submission: {
        id: "sub1",
        status: "submitted",
        submittedAt: "2026-01-01T00:00:00.000Z",
        maxScore: 20,
      },
    });
  });

  it("parsePracticeSubmitApiResponse rejects missing submission", () => {
    expect(parsePracticeSubmitApiResponse({ ok: true })).toEqual({
      error: "Не удалось обработать ответ сервера.",
    });
  });
});

describe("mapRowToPracticeSubmissionView", () => {
  it("hides admin comment until review outcome", () => {
    const pending = mapRowToPracticeSubmissionView(
      {
        id: "s1",
        status: "SUBMITTED",
        score: null,
        adminComment: "секрет",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      20,
    );
    expect(pending.feedback).toBeUndefined();

    const reviewed = mapRowToPracticeSubmissionView(
      {
        id: "s2",
        status: "NEEDS_REVISION",
        score: 4,
        adminComment: "добавьте ссылку",
        createdAt: "2026-01-02T00:00:00.000Z",
      },
      20,
    );
    expect(reviewed.feedback).toBe("добавьте ссылку");
    expect(JSON.stringify(reviewed)).not.toMatch(/answerKey|solution/i);
  });
});

describe("practice submission production path (static)", () => {
  it("server actions use enforceServerActionRateLimit not sync dev limiter", () => {
    const practice = read("lib/actions/practice.ts");
    expect(practice).toMatch(/enforceServerActionRateLimit\("practiceText"/);
    expect(practice).toMatch(/buildPracticeTextSubmitPayload/);
    expect(practice).toMatch(/loadLatestPracticeSubmissionView/);
    expect(practice).not.toMatch(/consumeRateLimitSync/);
  });

  it("upload routes use withApiGuard and validatePracticeUpload", () => {
    const upload = read("app/api/practice/upload-file/route.ts");
    const combined = read("app/api/practice/submit-combined/route.ts");
    expect(upload).toMatch(/withApiGuard\(UPLOAD_API_GUARD/);
    expect(upload).toMatch(/validatePracticeUpload/);
    expect(upload).toMatch(/loadLatestPracticeSubmissionView/);
    expect(combined).toMatch(/guardPracticeSubmission/);
    expect(combined).toMatch(/submission/);
  });

  it("rate-limit-service refuses sync limiter in production", () => {
    const src = read("lib/security/rate-limit-service.ts");
    expect(src).toMatch(/sync limiter refused in production/);
    expect(src).toMatch(/Redis unavailable in production/);
  });
});
