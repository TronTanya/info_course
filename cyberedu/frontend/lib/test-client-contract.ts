import type { ClientTestAnswerOption, ClientTestQuestion } from "@/lib/test-grading";
import { collectForbiddenKeys } from "@/lib/test-view-mapper";

/** Публичные поля вопроса/варианта на клиенте (контракт ЭТАП 16). */
export const CLIENT_TEST_ANSWER_PUBLIC_KEYS = ["id", "answerText"] as const;
export const CLIENT_TEST_QUESTION_PUBLIC_KEYS = [
  "id",
  "questionText",
  "questionType",
  "points",
  "orderNumber",
  "answers",
  "manualTextGrading",
] as const;

const FORBIDDEN_ON_CLIENT = [
  "isCorrect",
  "correctOptionId",
  "correctAnswerId",
  "answerKey",
  "textExpectedAnswer",
  "explanation",
  "solution",
  "solutionText",
  "scoringRules",
  "rawScoringRules",
  "adminNotes",
  "internalNotes",
  "graderNotes",
  "topic",
] as const;

/** Регрессия: объект не содержит полей с ключами ответов/эталонов. */
export function assertClientTestQuestionShape(
  question: ClientTestQuestion,
): { ok: true } | { ok: false; keys: string[] } {
  const found = collectForbiddenKeys(question);
  for (const k of FORBIDDEN_ON_CLIENT) {
    if (k in question) found.add(k);
  }
  for (const a of question.answers) {
    for (const k of FORBIDDEN_ON_CLIENT) {
      if (k in a) found.add(`answers.${k}`);
    }
    const allowed = new Set(CLIENT_TEST_ANSWER_PUBLIC_KEYS);
    for (const key of Object.keys(a)) {
      if (!allowed.has(key as (typeof CLIENT_TEST_ANSWER_PUBLIC_KEYS)[number])) {
        found.add(`answers.${key}`);
      }
    }
  }
  if (found.size > 0) return { ok: false, keys: [...found] };
  return { ok: true };
}

export function sampleClientTestQuestion(): ClientTestQuestion {
  const answers: ClientTestAnswerOption[] = [
    { id: "a1", answerText: "A" },
    { id: "a2", answerText: "B" },
  ];
  return {
    id: "q1",
    questionText: "Sample?",
    questionType: "SINGLE_CHOICE",
    points: 1,
    orderNumber: 1,
    answers,
  };
}
