/**
 * UI-модели контрольного теста модуля.
 *
 * Намеренно отсутствуют: correctOptionId, answerKey, raw scoring rules,
 * admin-only notes, private server fields, solution text (кроме safe explanations
 * в ResultViewModel через отдельный санитайзер).
 */

export type TestStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "passed"
  | "failed"
  | "locked";

export type TestQuestionDifficulty = "easy" | "medium" | "hard";

export type TestNextStepType = "lesson" | "practice" | "course" | "certificate";

export type TestNextStep = {
  title: string;
  href: string;
  type: TestNextStepType;
};

export type TestOptionView = {
  id: string;
  text: string;
};

export type TestQuestionView = {
  id: string;
  order: number;
  prompt: string;
  options: TestOptionView[];
  topic?: string;
  difficulty?: TestQuestionDifficulty;
};

/**
 * Черновик ответа с одним выбранным вариантом (single / true-false / situation).
 * Для multiple и text на экране прохождения используется локальное состояние сессии,
 * не серверный ключ ответа.
 */
export type TestAnswerDraft = {
  questionId: string;
  optionId: string;
};

export type TestViewModel = {
  id: string;
  title: string;
  description?: string;
  moduleId: string;
  moduleTitle: string;
  questionCount: number;
  passingScore?: number;
  estimatedMinutes?: number;
  timeLimitSeconds?: number;
  attemptLimit?: number;
  attemptsUsed?: number;
  status: TestStatus;
  lockedReason?: string;
  questions: TestQuestionView[];
  canStart: boolean;
  canSubmit: boolean;
  canRetry: boolean;
  nextPractice?: TestNextStep;
  relatedLessons?: TestNextStep[];
};

export type WeakTopic = {
  title: string;
  reason?: string;
  relatedLessonHref?: string;
};

export type StrongTopic = {
  title: string;
};

export type Recommendation = {
  title: string;
  description?: string;
  href?: string;
};

export type TestResultViewModel = {
  attemptId: string;
  score: number;
  maxScore?: number;
  percentage: number;
  passed: boolean;
  correctCount?: number;
  totalCount: number;
  weakTopics: WeakTopic[];
  strongTopics: StrongTopic[];
  recommendations: Recommendation[];
  canRetry: boolean;
  nextStep?: TestNextStep;
};

/** Поля, которые нельзя добавлять в UI-модель теста (регрессионный контракт). */
export const TEST_VIEW_MODEL_FORBIDDEN_KEYS = [
  "correctOptionId",
  "correctAnswerId",
  "answerKey",
  "isCorrect",
  "solution",
  "solutionText",
  "scoringRules",
  "rawScoringRules",
  "adminNotes",
  "internalNotes",
  "graderNotes",
] as const;
