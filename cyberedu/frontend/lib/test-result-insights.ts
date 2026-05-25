import {
  resolveServerQuestionFeedback,
  resolveServerQuestionTopic,
  type TestReviewFeedbackRow,
} from "@/lib/test-question-feedback";

export type TestReviewRow = TestReviewFeedbackRow & {
  pointsEarned: number;
  maxPoints: number;
};

export type TestTopicInsight = {
  questionIndex: number;
  topicLabel: string;
  detail: string | null;
};

export type TestResultInsights = {
  strengths: TestTopicInsight[];
  toReview: TestTopicInsight[];
  pendingCount: number;
  gradedCount: number;
};

/** Короткая подпись темы из текста вопроса (без раскрытия ответа). */
export function topicLabelFromQuestion(questionText: string, maxLen = 72): string {
  const oneLine = questionText.replace(/\s+/g, " ").trim();
  if (!oneLine) return "Вопрос";
  const cut = oneLine.split(/[.?！]/)[0]?.trim() || oneLine;
  if (cut.length <= maxLen) return cut;
  const slice = cut.slice(0, maxLen - 1).trim();
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > 24 ? slice.slice(0, lastSpace) : slice;
  return `${base}…`;
}

function toInsight(row: TestReviewRow, index: number): TestTopicInsight {
  return {
    questionIndex: index + 1,
    topicLabel: resolveServerQuestionTopic(row) ?? topicLabelFromQuestion(row.questionText),
    detail: resolveServerQuestionFeedback(row),
  };
}

/** Группировка результата для блоков «знаете хорошо» / «повторить» (только серверный review). */
export function buildTestResultInsights(review: TestReviewRow[]): TestResultInsights {
  const strengths: TestTopicInsight[] = [];
  const toReview: TestTopicInsight[] = [];
  let pendingCount = 0;

  review.forEach((row, index) => {
    if (row.isCorrect === null) {
      pendingCount += 1;
      return;
    }
    const insight = toInsight(row, index);
    if (row.isCorrect) strengths.push(insight);
    else toReview.push(insight);
  });

  return {
    strengths,
    toReview,
    pendingCount,
    gradedCount: review.length - pendingCount,
  };
}
