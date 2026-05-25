/**
 * Клиентский payload для submitTestAttemptAction: только questionId + выбор/id текста.
 * Без isCorrect, без эталонных ответов, без score.
 */

import type { ClientTestQuestion } from "@/lib/test-grading";
import type { SubmittedAnswerPayload } from "@/lib/test-grading";
import type { TestLocalAnswers } from "@/lib/test-taking";

/** Один ответ на вопрос; только id вариантов / текст — без isCorrect и эталонов. */
export function buildTestSubmitPayload(
  questions: ClientTestQuestion[],
  local: TestLocalAnswers,
): SubmittedAnswerPayload[] {
  return questions.map((q) => {
    if (q.questionType === "MULTIPLE_CHOICE" || q.questionType === "MATCHING") {
      return { questionId: q.id, kind: "multi" as const, answerIds: [...(local.multi[q.id] ?? [])] };
    }
    if (q.questionType === "TEXT") {
      return { questionId: q.id, kind: "text" as const, text: (local.text[q.id] ?? "").trim() };
    }
    const answerId = local.single[q.id];
    return { questionId: q.id, kind: "single" as const, answerId: answerId! };
  });
}

/** Убирает поля, которые клиент не должен слать (защита от расширенного JSON). */
export function sanitizeSubmittedAnswersForTransport(
  raw: unknown,
): SubmittedAnswerPayload[] | null {
  if (!Array.isArray(raw)) return null;
  const out: SubmittedAnswerPayload[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const o = item as Record<string, unknown>;
    const questionId = o.questionId;
    if (typeof questionId !== "string" || !questionId) return null;
    const kind = o.kind;
    if (kind === "single") {
      const answerId = o.answerId;
      if (typeof answerId !== "string" || !answerId) return null;
      out.push({ questionId, kind: "single", answerId });
    } else if (kind === "multi") {
      const answerIds = o.answerIds;
      if (!Array.isArray(answerIds) || answerIds.some((id) => typeof id !== "string")) return null;
      out.push({ questionId, kind: "multi", answerIds: answerIds as string[] });
    } else if (kind === "text") {
      const text = o.text;
      if (typeof text !== "string") return null;
      out.push({ questionId, kind: "text", text });
    } else {
      return null;
    }
  }
  return out;
}
