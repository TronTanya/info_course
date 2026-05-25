import type { Answer, Question, QuestionType } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  buildTestSubmitPayload,
  sanitizeSubmittedAnswersForTransport,
} from "@/lib/test-submit-payload";
import { validateSubmissionForQuestion, type ClientTestQuestion } from "@/lib/test-grading";
import { emptyTestLocalAnswers } from "@/lib/test-taking";

function prismaQ(
  id: string,
  type: QuestionType = "SINGLE_CHOICE",
  answers: Partial<Answer>[] = [
    { id: "a1", answerText: "One", isCorrect: true },
    { id: "a2", answerText: "Two", isCorrect: false },
  ],
): Question & { answers: Answer[] } {
  return {
    id,
    testId: "t1",
    questionText: "Q?",
    questionType: type,
    points: 1,
    orderNumber: 1,
    explanation: null,
    textExpectedAnswer: null,
    textManualGrading: false,
    answers: answers.map((a, i) => ({
      id: a.id ?? `a${i}`,
      questionId: id,
      answerText: a.answerText ?? "",
      isCorrect: a.isCorrect ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as Answer[],
  } as Question & { answers: Answer[] };
}

const clientQ = (id: string): ClientTestQuestion => ({
  id,
  questionText: "Q?",
  questionType: "SINGLE_CHOICE",
  points: 1,
  orderNumber: 1,
  answers: [
    { id: "a1", answerText: "One" },
    { id: "a2", answerText: "Two" },
  ],
});

describe("test submit payload (client)", () => {
  it("buildTestSubmitPayload sends only questionId and answer ids", () => {
    const questions = [clientQ("q1")];
    const local = emptyTestLocalAnswers(questions);
    local.single.q1 = "a2";
    const payload = buildTestSubmitPayload(questions, local);
    expect(payload).toEqual([{ questionId: "q1", kind: "single", answerId: "a2" }]);
    expect(JSON.stringify(payload)).not.toMatch(/isCorrect|correctAnswer|textExpected/i);
  });

  it("sanitizeSubmittedAnswersForTransport strips extra fields", () => {
    const raw = [
      {
        questionId: "q1",
        kind: "single",
        answerId: "a1",
        isCorrect: true,
        correctAnswer: "secret",
      },
    ];
    const out = sanitizeSubmittedAnswersForTransport(raw);
    expect(out).toEqual([{ questionId: "q1", kind: "single", answerId: "a1" }]);
  });
});

describe("validateSubmissionForQuestion (server-side shape)", () => {
  it("rejects foreign answer id", () => {
    const q = prismaQ("q1");
    const bad = { questionId: "q1", kind: "single" as const, answerId: "evil" };
    expect(validateSubmissionForQuestion(q, bad)).toEqual({
      ok: false,
      error: "Некорректный выбор варианта ответа.",
    });
  });

  it("accepts valid single choice", () => {
    const q = prismaQ("q1");
    const ok = { questionId: "q1", kind: "single" as const, answerId: "a1" };
    expect(validateSubmissionForQuestion(q, ok)).toEqual({ ok: true });
  });
});
