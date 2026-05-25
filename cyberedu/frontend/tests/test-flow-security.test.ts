import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { formatMentorTestSummary } from "@/lib/ai/mentor-ui/test-summary";
import { LESSON_MENTOR_FORBIDDEN_CONTEXT_KEYS } from "@/lib/lesson-mentor-panel";
import {
  assertClientTestQuestionShape,
  sampleClientTestQuestion,
} from "@/lib/test-client-contract";
import { calculateTestScore } from "@/lib/test-grading";
import { buildTestSubmitPayload, sanitizeSubmittedAnswersForTransport } from "@/lib/test-submit-payload";
import { emptyTestLocalAnswers } from "@/lib/test-taking";
import { collectForbiddenKeys } from "@/lib/test-view-mapper";
import { buildTestResultViewModel } from "@/lib/test-view-mapper";
import { TEST_VIEW_MODEL_FORBIDDEN_KEYS } from "@/types/test-view-model";

const frontendRoot = join(__dirname, "..");

describe("ETAP 16 — client test payload contract", () => {
  it("ClientTestQuestion sample has no forbidden keys", () => {
    expect(assertClientTestQuestionShape(sampleClientTestQuestion())).toEqual({ ok: true });
  });

  it("buildTestSubmitPayload never includes grading fields", () => {
    const q = sampleClientTestQuestion();
    const local = emptyTestLocalAnswers([q]);
    local.single.q1 = "a1";
    const payload = buildTestSubmitPayload([q], local);
    const forbidden = collectForbiddenKeys(payload);
    expect(forbidden.size).toBe(0);
    expect(JSON.stringify(payload)).not.toMatch(/score|percent|isCorrect|textExpected/i);
  });
});

describe("ETAP 16 — test page load strips server-only fields", () => {
  it("loadTestPageData prisma select excludes isCorrect and explanation", () => {
    const src = readFileSync(join(frontendRoot, "lib/test-page-load.ts"), "utf8");
    expect(src).not.toMatch(/isCorrect:\s*true/);
    expect(src).not.toMatch(/textExpectedAnswer:\s*true/);
    expect(src).not.toMatch(/explanation:\s*true/);
    expect(src).toContain("select: { id: true, answerText: true }");
  });
});

describe("ETAP 16 — server-only scoring", () => {
  it("calculateTestScore runs only with full prisma-shaped questions", () => {
    const q = {
      id: "q1",
      testId: "t",
      questionText: "Q",
      questionType: "SINGLE_CHOICE" as const,
      points: 2,
      orderNumber: 1,
      explanation: null,
      textExpectedAnswer: null,
      textManualGrading: false,
      topic: null,
      answers: [
        {
          id: "a1",
          questionId: "q1",
          answerText: "Yes",
          isCorrect: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "a2",
          questionId: "q1",
          answerText: "No",
          isCorrect: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
    const result = calculateTestScore({
      questions: [q],
      answers: [{ questionId: "q1", kind: "single", answerId: "a2" }],
      minScore: 1,
    });
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });

  it("sanitizeSubmittedAnswersForTransport rejects injected score fields", () => {
    const out = sanitizeSubmittedAnswersForTransport([
      { questionId: "q1", kind: "single", answerId: "a1", score: 100, passed: true },
    ]);
    expect(out).toEqual([{ questionId: "q1", kind: "single", answerId: "a1" }]);
  });
});

describe("ETAP 16 — result view model", () => {
  it("buildTestResultViewModel omits forbidden keys", () => {
    const model = buildTestResultViewModel({
      attemptId: "x",
      score: 8,
      maxScore: 10,
      percentage: 80,
      passed: true,
      moduleId: "m1",
      totalCount: 1,
      review: [
        {
          questionId: "q1",
          questionText: "Q1",
          topic: "Topic",
          feedback: null,
          explanation: "Правильный ответ — B",
          isCorrect: false,
          showGradingStatus: true,
        },
      ],
      canRetry: true,
    });
    expect(collectForbiddenKeys(model).size).toBe(0);
    expect(TEST_VIEW_MODEL_FORBIDDEN_KEYS).toContain("answerKey");
  });
});

describe("ETAP 16 — AI mentor", () => {
  it("testSummary helper has no answer ids", () => {
    const s = formatMentorTestSummary({
      title: "Модульный тест",
      percent: 70,
      passed: false,
      correctCount: 7,
      totalGraded: 10,
    });
    expect(s).not.toMatch(/correctOption|answerKey|isCorrect/i);
    expect(s).toContain("70%");
  });

  it("lesson mentor forbids test answer context keys", () => {
    expect(LESSON_MENTOR_FORBIDDEN_CONTEXT_KEYS).toContain("correctOptionId");
    expect(LESSON_MENTOR_FORBIDDEN_CONTEXT_KEYS).toContain("testAnswers");
  });
});

describe("ETAP 16 — submit action hardening", () => {
  it("submitTestAttemptAction source sanitizes client answers", () => {
    const src = readFileSync(join(frontendRoot, "lib/actions/test.ts"), "utf8");
    expect(src).toMatch(/sanitizeSubmittedAnswersForTransport/);
    expect(src).toMatch(/enforceServerActionRateLimit\("testSubmit"/);
    expect(src).toMatch(/checkTestPrerequisites/);
    expect(src).toMatch(/calculateTestScore/);
    expect(src).not.toMatch(/answers:\s*input\.answers/);
  });
});
