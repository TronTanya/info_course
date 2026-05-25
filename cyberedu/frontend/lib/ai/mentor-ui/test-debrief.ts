import {
  buildSafeQuestionFeedbackList,
  type TestReviewFeedbackRow,
} from "@/lib/test-question-feedback";

/**
 * Безопасный текст для наставника после теста: только темы и серверная обратная связь
 * по неверным ответам — без текста вопросов, вариантов и правильных ключей.
 */
export function buildMentorTestDebriefHint(review: TestReviewFeedbackRow[]): string | null {
  const items = buildSafeQuestionFeedbackList(review).filter(
    (item) => item.gradingStatus === "not_credited",
  );
  if (items.length === 0) return null;

  const lines = items.map((item) => {
    const head = `Вопрос ${item.questionIndex}: ${item.topic}`;
    return item.feedback ? `${head}. Обратная связь: ${item.feedback}` : head;
  });

  return [
    "Темы для повторения после теста (без правильных ответов и без вариантов):",
    ...lines,
  ].join("\n");
}
