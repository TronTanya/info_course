/** Проект требует ответов на все вопросы (см. submitTestAttemptAction + module-test-runner). */
export const TEST_REQUIRES_ALL_ANSWERS = true;

export const TEST_SUBMIT_CONFIRM_TITLE = "Отправить тест на проверку?";

export const TEST_SUBMIT_WARNING =
  "После отправки тест будет проверен на сервере — изменить ответы нельзя. Результат и разбор появятся на этой странице.";

export const TEST_SUBMIT_ALL_REQUIRED_HINT =
  "Нужно ответить на все вопросы — кнопка отправки станет доступна, когда не останется пропусков.";

export type TestSubmitSummary = {
  total: number;
  answered: number;
  unanswered: number;
  unansweredIndexes: number[];
  allAnswered: boolean;
  canSubmit: boolean;
  blockReason: string | null;
};

export function buildTestSubmitSummary(
  total: number,
  answeredCount: number,
  unansweredIndexes: number[],
): TestSubmitSummary {
  const answered = Math.min(answeredCount, total);
  const unanswered = Math.max(0, total - answered);
  const allAnswered = total > 0 && unanswered === 0;
  const canSubmit = TEST_REQUIRES_ALL_ANSWERS ? allAnswered : total > 0;
  const blockReason =
    TEST_REQUIRES_ALL_ANSWERS && !allAnswered && total > 0 ? TEST_SUBMIT_ALL_REQUIRED_HINT : null;

  return {
    total,
    answered,
    unanswered,
    unansweredIndexes,
    allAnswered,
    canSubmit,
    blockReason,
  };
}

export function formatUnansweredList(indexes: number[], maxVisible = 12): string {
  if (indexes.length === 0) return "";
  if (indexes.length <= maxVisible) return indexes.join(", ");
  const head = indexes.slice(0, maxVisible).join(", ");
  return `${head} и ещё ${indexes.length - maxVisible}`;
}
