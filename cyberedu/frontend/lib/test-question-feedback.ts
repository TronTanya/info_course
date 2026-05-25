import { safeTestExplanation } from "@/lib/test-explanation-safety";

/** Строка review с сервера после submit (без answer key / correct option id). */
export type TestReviewFeedbackRow = {
  questionId: string;
  questionText: string;
  /** Явная тема с сервера (поле Question.topic). */
  topic?: string | null;
  /** Санитизированный обучающий текст с сервера. */
  feedback?: string | null;
  /** @deprecated Используйте `feedback`; дублирует серверное поле для совместимости. */
  explanation?: string | null;
  isCorrect: boolean | null;
  /** Сервер разрешает показать «засчитан / не засчитан» (авто-проверка). */
  showGradingStatus?: boolean;
  pointsEarned?: number;
  maxPoints?: number;
};

export type QuestionGradingStatus = "credited" | "not_credited" | "pending";

export type SafeQuestionFeedbackItem = {
  questionIndex: number;
  topic: string;
  feedback: string | null;
  gradingStatus: QuestionGradingStatus | null;
};

const GRADING_STATUS_LABEL: Record<QuestionGradingStatus, string> = {
  credited: "Ответ засчитан",
  not_credited: "Ответ не засчитан",
  pending: "Ожидает проверки",
};

export function questionGradingStatusLabel(status: QuestionGradingStatus): string {
  return GRADING_STATUS_LABEL[status];
}

/** Только серверный feedback/explanation; без клиентской генерации текста по isCorrect. */
export function resolveServerQuestionFeedback(row: TestReviewFeedbackRow): string | null {
  const raw = row.feedback ?? row.explanation;
  return safeTestExplanation(raw);
}

export function resolveServerQuestionTopic(row: TestReviewFeedbackRow): string | null {
  const t = row.topic?.trim();
  return t && t.length > 0 ? t.slice(0, 120) : null;
}

export function resolveQuestionGradingStatus(
  row: TestReviewFeedbackRow,
): QuestionGradingStatus | null {
  if (row.showGradingStatus === false) return null;
  if (row.isCorrect === null) return "pending";
  return row.isCorrect ? "credited" : "not_credited";
}

/**
 * Элемент списка обратной связи: есть безопасный текст и/или явная тема с сервера.
 * Текст вопроса и баллы в UI не используются.
 */
export function toSafeQuestionFeedbackItem(
  row: TestReviewFeedbackRow,
  index: number,
): SafeQuestionFeedbackItem | null {
  const feedback = resolveServerQuestionFeedback(row);
  const serverTopic = resolveServerQuestionTopic(row);
  const gradingStatus = resolveQuestionGradingStatus(row);

  if (!feedback && !serverTopic) return null;

  const topic = serverTopic ?? `Вопрос ${index + 1}`;

  return {
    questionIndex: index + 1,
    topic,
    feedback,
    gradingStatus: gradingStatus && (feedback || serverTopic) ? gradingStatus : null,
  };
}

export function buildSafeQuestionFeedbackList(
  review: TestReviewFeedbackRow[],
): SafeQuestionFeedbackItem[] {
  return review
    .map((row, index) => toSafeQuestionFeedbackItem(row, index))
    .filter((item): item is SafeQuestionFeedbackItem => item != null);
}

/** Есть хотя бы один вопрос с безопасной обратной связью с сервера. */
export function hasSafePerQuestionFeedback(review: TestReviewFeedbackRow[]): boolean {
  return buildSafeQuestionFeedbackList(review).length > 0;
}
