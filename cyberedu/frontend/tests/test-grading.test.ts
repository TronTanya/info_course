import type { Answer, Question, QuestionType } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { calculateTestScore, gradeQuestion, questionCountsTowardAutoScore, type SubmittedAnswerPayload } from "@/lib/test-grading";

function q(
  id: string,
  type: QuestionType,
  points: number,
  answers: Partial<Answer>[],
  extra: Partial<Question> = {},
): Question & { answers: Answer[] } {
  return {
    id,
    testId: "test1",
    questionText: "Q",
    questionType: type,
    points,
    orderNumber: 1,
    explanation: null,
    textExpectedAnswer: null,
    textManualGrading: false,
    ...extra,
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

describe("calculateTestScore", () => {
  it("считает баллы и зачёт по minScore", () => {
    const questions = [
      q("q1", "SINGLE_CHOICE", 10, [
        { id: "w", isCorrect: false },
        { id: "r", isCorrect: true },
      ]),
    ];
    const answers: SubmittedAnswerPayload[] = [{ questionId: "q1", kind: "single", answerId: "r" }];
    expect(calculateTestScore({ questions, answers, minScore: 5 })).toEqual({
      score: 10,
      maxScore: 10,
      passed: true,
      percent: 100,
    });
    expect(calculateTestScore({ questions, answers, minScore: 11 })).toMatchObject({
      score: 10,
      passed: false,
      percent: 100,
    });
  });

  it("при maxScore 0 — не зачтено", () => {
    const questions = [
      q("q1", "TEXT", 5, [], { textManualGrading: true, textExpectedAnswer: null }),
    ];
    const answers: SubmittedAnswerPayload[] = [{ questionId: "q1", kind: "text", text: "hello" }];
    expect(questionCountsTowardAutoScore(questions[0]!)).toBe(false);
    expect(calculateTestScore({ questions, answers, minScore: 0 })).toEqual({
      score: 0,
      maxScore: 0,
      passed: false,
      percent: 0,
    });
  });
});

describe("gradeQuestion", () => {
  it("MULTIPLE_CHOICE: только полный набор правильных", () => {
    const question = q("qm", "MULTIPLE_CHOICE", 4, [
      { id: "a", isCorrect: true },
      { id: "b", isCorrect: true },
      { id: "c", isCorrect: false },
    ]);
    expect(
      gradeQuestion(question, { questionId: "qm", kind: "multi", answerIds: ["a", "b"] }).pointsEarned,
    ).toBe(4);
    expect(
      gradeQuestion(question, { questionId: "qm", kind: "multi", answerIds: ["a"] }).pointsEarned,
    ).toBe(0);
  });

  it("TEXT с ожидаемым ответом: нормализация пробелов", () => {
    const question = q("qt", "TEXT", 2, [], { textExpectedAnswer: "Hello  World", textManualGrading: false });
    expect(
      gradeQuestion(question, { questionId: "qt", kind: "text", text: "  hello world  " }).pointsEarned,
    ).toBe(2);
  });
});
