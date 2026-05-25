import type { PracticeSubmissionView } from "@/types/practice-view-model";

/** Поля, которые клиент не должен отправлять на сервер. */
export const FORBIDDEN_PRACTICE_SUBMIT_CLIENT_KEYS = [
  "solution",
  "solutionText",
  "answerKey",
  "correctFlagIds",
  "requiredIds",
  "reflectionPattern",
  "autoKeywords",
  "explanationPattern",
  "expected",
  "expectedCommand",
  "expectedAnswerPattern",
  "interactiveExpectedAnswer",
  "gradingRubric",
  "hiddenRubric",
  "scenarioData",
  "adminNotes",
  "internalNotes",
  "userSecret",
  "score",
  "status",
  "isCorrect",
] as const;

const FORBIDDEN_SET = new Set<string>(FORBIDDEN_PRACTICE_SUBMIT_CLIENT_KEYS);

export function stripForbiddenPracticeSubmitFields(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (FORBIDDEN_SET.has(key)) continue;
    out[key] = value;
  }
  return out;
}

export function buildPracticeTextSubmitPayload(input: {
  moduleId: string;
  practicalTaskId: string;
  text: string;
}): { moduleId: string; practicalTaskId: string; text: string } {
  const safe = stripForbiddenPracticeSubmitFields(input as Record<string, unknown>);
  return {
    moduleId: String(safe.moduleId ?? input.moduleId).trim(),
    practicalTaskId: String(safe.practicalTaskId ?? input.practicalTaskId).trim(),
    text: String(safe.text ?? input.text).trim(),
  };
}

export function buildPracticeStructuredSubmitPayload(input: {
  moduleId: string;
  practicalTaskId: string;
  payload: string;
}): { moduleId: string; practicalTaskId: string; payload: string } {
  const safe = stripForbiddenPracticeSubmitFields(input as Record<string, unknown>);
  return {
    moduleId: String(safe.moduleId ?? input.moduleId).trim(),
    practicalTaskId: String(safe.practicalTaskId ?? input.practicalTaskId).trim(),
    payload: String(safe.payload ?? input.payload).trim(),
  };
}

export function buildPracticeUploadFormData(input: {
  moduleId: string;
  practicalTaskId: string;
  file: File;
  text?: string;
}): FormData {
  const fd = new FormData();
  fd.set("moduleId", input.moduleId.trim());
  fd.set("practicalTaskId", input.practicalTaskId.trim());
  if (input.text != null) {
    fd.set("text", input.text.trim());
  }
  fd.set("file", input.file);
  return fd;
}

export type PracticeSubmitApiSuccess = {
  ok: true;
  submission: PracticeSubmissionView;
};

export type PracticeSubmitApiFailure = {
  ok?: false;
  error: string;
};

export function parsePracticeSubmitApiResponse(
  json: unknown,
): PracticeSubmitApiSuccess | PracticeSubmitApiFailure {
  if (!json || typeof json !== "object") {
    return { error: "Некорректный ответ сервера." };
  }
  const o = json as Record<string, unknown>;
  if (o.error && typeof o.error === "string") {
    return { error: o.error };
  }
  if (o.ok === true && o.submission && typeof o.submission === "object") {
    const sub = o.submission as PracticeSubmissionView;
    if (typeof sub.id === "string" && typeof sub.status === "string") {
      return { ok: true, submission: sub };
    }
  }
  return { error: "Не удалось обработать ответ сервера." };
}

export function practiceSubmitSuccessMessage(
  submission: PracticeSubmissionView,
  pendingReview?: boolean,
): string {
  if (submission.status === "approved") {
    return submission.score != null
      ? `Зачтено: ${submission.score}${submission.maxScore != null ? ` из ${submission.maxScore}` : ""} баллов.`
      : "Практика зачтена.";
  }
  if (pendingReview || submission.status === "pending_review") {
    return "Ответ принят и ожидает проверки.";
  }
  if (submission.status === "submitted") {
    return "Работа отправлена на проверку.";
  }
  return "Ответ сохранён.";
}
