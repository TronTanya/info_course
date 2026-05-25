import { moduleDifficultyByOrder } from "@/lib/course-path-ui";
import {
  resolveServerQuestionFeedback,
  resolveServerQuestionTopic,
} from "@/lib/test-question-feedback";
import { topicLabelFromQuestion } from "@/lib/test-result-insights";
import type { ClientTestQuestion } from "@/lib/test-grading";
import { estimateTestMinutes } from "@/lib/test-ui";
import { testTimeLimitSeconds } from "@/lib/test-taking";
import type {
  Recommendation,
  StrongTopic,
  TestNextStep,
  TestQuestionDifficulty,
  TestQuestionView,
  TestResultViewModel,
  TestStatus,
  TestViewModel,
  WeakTopic,
} from "@/types/test-view-model";
import { TEST_VIEW_MODEL_FORBIDDEN_KEYS } from "@/types/test-view-model";

export type BuildTestViewModelInput = {
  testId: string;
  title: string;
  description?: string | null;
  moduleId: string;
  moduleTitle: string;
  moduleOrderNumber: number;
  moduleDescription?: string | null;
  minScore: number;
  questions: ClientTestQuestion[];
  /** Попыток уже сохранено на сервере для этого теста */
  attemptsUsed?: number;
  attemptLimit?: number | null;
  timeLimitMinutes?: number | null;
  locked?: boolean;
  lockedReason?: string;
  lastAttempt?: { passed: boolean } | null;
  /** Фаза клиентского раннера */
  phase?: "lobby" | "active" | "result";
  practiceUnlocked?: boolean;
  lessonHref?: string;
  courseHref?: string;
};

export type BuildTestResultViewModelInput = {
  attemptId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  correctCount?: number;
  totalCount: number;
  review: TestResultReviewSourceRow[];
  canRetry?: boolean;
  moduleId: string;
  practiceUnlocked?: boolean;
  attemptLimit?: number | null;
  attemptsUsed?: number;
};

export type TestResultReviewSourceRow = {
  questionId: string;
  questionText: string;
  topic?: string | null;
  feedback?: string | null;
  explanation?: string | null;
  isCorrect: boolean | null;
  showGradingStatus?: boolean;
};

function questionDifficulty(moduleOrder: number, points: number): TestQuestionDifficulty {
  const band = moduleDifficultyByOrder(moduleOrder);
  if (band === "Начальный" && points <= 1) return "easy";
  if (band === "Продвинутый" || points >= 3) return "hard";
  return "medium";
}

function mapQuestionToView(q: ClientTestQuestion, moduleOrderNumber: number): TestQuestionView {
  return {
    id: q.id,
    order: q.orderNumber,
    prompt: q.questionText,
    options: q.answers.map((a) => ({
      id: a.id,
      text: a.answerText,
    })),
    topic: topicLabelFromQuestion(q.questionText, 64),
    difficulty: questionDifficulty(moduleOrderNumber, q.points),
  };
}

export function resolveTestViewStatus(input: {
  locked?: boolean;
  phase?: "lobby" | "active" | "result";
  lastPassed?: boolean;
  attemptsExhausted?: boolean;
}): TestStatus {
  if (input.locked) return "locked";
  if (input.phase === "active") return "in_progress";
  if (input.phase === "result") {
    return input.lastPassed ? "passed" : "failed";
  }
  if (input.attemptsExhausted && !input.lastPassed) return "failed";
  if (input.lastPassed) return "passed";
  return "not_started";
}

function buildRelatedLessons(lessonHref: string | undefined, moduleTitle: string): TestNextStep[] | undefined {
  if (!lessonHref) return undefined;
  return [
    {
      title: `Повторить материал · ${moduleTitle}`,
      href: lessonHref,
      type: "lesson",
    },
  ];
}

function attemptsExhausted(attemptsUsed: number, attemptLimit: number | null | undefined): boolean {
  return attemptLimit != null && attemptLimit > 0 && attemptsUsed >= attemptLimit;
}

export function buildTestViewModel(input: BuildTestViewModelInput): TestViewModel {
  const questionCount = input.questions.length;
  const estimatedMinutes = estimateTestMinutes(questionCount);
  const timeLimitSeconds = testTimeLimitSeconds(input.timeLimitMinutes);
  const attemptsUsed = input.attemptsUsed ?? 0;
  const attemptLimit =
    input.attemptLimit != null && input.attemptLimit > 0 ? input.attemptLimit : undefined;
  const exhausted = attemptsExhausted(attemptsUsed, input.attemptLimit);
  const lastPassed = Boolean(input.lastAttempt?.passed);
  const locked = Boolean(input.locked);

  const lessonHref = input.lessonHref ?? `/dashboard/course/${input.moduleId}/lesson`;
  const practiceHref = `/dashboard/course/${input.moduleId}/practice`;

  const status = resolveTestViewStatus({
    locked,
    phase: input.phase,
    lastPassed,
    attemptsExhausted: exhausted,
  });

  const canStart =
    !locked && !exhausted && input.phase !== "active" && questionCount > 0;
  const canSubmit = input.phase === "active" && !locked;
  const canRetry =
    !locked && !exhausted && (lastPassed || status === "failed" || status === "passed");

  const description =
    input.description?.trim() ||
    input.moduleDescription?.trim()?.slice(0, 320) ||
    undefined;

  return {
    id: input.testId,
    title: input.title,
    description,
    moduleId: input.moduleId,
    moduleTitle: input.moduleTitle,
    questionCount,
    passingScore: input.minScore > 0 ? input.minScore : undefined,
    estimatedMinutes: estimatedMinutes > 0 ? estimatedMinutes : undefined,
    timeLimitSeconds: timeLimitSeconds ?? undefined,
    attemptLimit,
    attemptsUsed: attemptsUsed > 0 ? attemptsUsed : undefined,
    status,
    lockedReason: locked ? input.lockedReason?.trim() || "Сначала завершите предыдущие шаги модуля." : undefined,
    questions: input.questions.map((q) => mapQuestionToView(q, input.moduleOrderNumber)),
    canStart,
    canSubmit,
    canRetry,
    nextPractice:
      input.practiceUnlocked || lastPassed
        ? {
            title: "Практика модуля",
            href: practiceHref,
            type: "practice",
          }
        : undefined,
    relatedLessons: buildRelatedLessons(lessonHref, input.moduleTitle),
  };
}

function buildWeakTopics(
  review: TestResultReviewSourceRow[],
  lessonHref: string,
): WeakTopic[] {
  return review
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => row.isCorrect === false)
    .map(({ row }) => ({
      title: resolveServerQuestionTopic(row) ?? topicLabelFromQuestion(row.questionText),
      reason: resolveServerQuestionFeedback(row) ?? undefined,
      relatedLessonHref: lessonHref,
    }));
}

function buildStrongTopics(review: TestResultReviewSourceRow[]): StrongTopic[] {
  return review
    .filter((row) => row.isCorrect === true)
    .map((row) => ({
      title: resolveServerQuestionTopic(row) ?? topicLabelFromQuestion(row.questionText),
    }));
}

function buildRecommendations(input: {
  passed: boolean;
  moduleId: string;
  lessonHref: string;
  practiceHref: string;
  courseHref: string;
  canRetry: boolean;
  pendingManual: number;
}): Recommendation[] {
  const items: Recommendation[] = [];

  if (!input.passed) {
    items.push({
      title: "Повторить материал",
      description: "Вернитесь к лекции и ключевым идеям модуля перед следующей попыткой.",
      href: input.lessonHref,
    });
    items.push({
      title: "Разобрать слабые темы",
      description: "Сфокусируйтесь на вопросах из блока «Повторить» в результате теста.",
      href: input.lessonHref,
    });
  } else {
    items.push({
      title: "Перейти к практике",
      description: "Закрепите знания в лабораторном сценарии модуля.",
      href: input.practiceHref,
    });
  }

  if (input.canRetry) {
    items.push({
      title: "Повторить тест",
      description: "Новая попытка с перемешанными вариантами ответов.",
      href: `/dashboard/course/${input.moduleId}/test`,
    });
  }

  items.push({
    title: "Вернуться к курсу",
    href: input.courseHref,
  });

  if (input.pendingManual > 0) {
    items.push({
      title: "Ожидание ручной проверки",
      description: `${input.pendingManual} ответ(ов) проверяется отдельно и не влияет на автоматический зачёт.`,
    });
  }

  return items;
}

export function buildTestResultViewModel(input: BuildTestResultViewModelInput): TestResultViewModel {
  const lessonHref = `/dashboard/course/${input.moduleId}/lesson`;
  const practiceHref = `/dashboard/course/${input.moduleId}/practice`;
  const courseHref = "/dashboard/course";
  const pendingManual = input.review.filter((r) => r.isCorrect === null).length;
  const exhausted = attemptsExhausted(input.attemptsUsed ?? 0, input.attemptLimit);
  const canRetry = input.canRetry ?? (!exhausted || input.passed);

  return {
    attemptId: input.attemptId,
    score: input.score,
    maxScore: input.maxScore > 0 ? input.maxScore : undefined,
    percentage: input.percentage,
    passed: input.passed,
    correctCount:
      input.correctCount != null && input.totalCount > 0 ? input.correctCount : undefined,
    totalCount: input.totalCount,
    weakTopics: buildWeakTopics(input.review, lessonHref),
    strongTopics: buildStrongTopics(input.review),
    recommendations: buildRecommendations({
      passed: input.passed,
      moduleId: input.moduleId,
      lessonHref,
      practiceHref,
      courseHref,
      canRetry,
      pendingManual,
    }),
    canRetry,
    nextStep: input.passed
      ? { title: "Практика модуля", href: practiceHref, type: "practice" }
      : { title: "Повторить материал", href: lessonHref, type: "lesson" },
  };
}

/** Рекурсивно проверяет отсутствие запрещённых ключей (для тестов). */
export function collectForbiddenKeys(value: unknown, found = new Set<string>()): Set<string> {
  if (value == null || typeof value !== "object") return found;
  if (Array.isArray(value)) {
    for (const item of value) collectForbiddenKeys(item, found);
    return found;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if ((TEST_VIEW_MODEL_FORBIDDEN_KEYS as readonly string[]).includes(key)) {
      found.add(key);
    }
    collectForbiddenKeys(child, found);
  }
  return found;
}

export function assertCleanTestViewPayload(value: unknown): void {
  const bad = [...collectForbiddenKeys(value)];
  if (bad.length > 0) {
    throw new Error(`Forbidden test view model keys: ${bad.join(", ")}`);
  }
}
