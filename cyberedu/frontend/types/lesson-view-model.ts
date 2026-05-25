/**
 * UI-модель страницы урока (клиент).
 * Не содержит ответов graded-тестов, admin-only полей и не дублирует серверные guards как источник истины.
 */

export type LessonStatus = "not_started" | "in_progress" | "completed" | "locked";

export type LessonObjective = {
  text: string;
};

export type KeyTerm = {
  term: string;
  definition: string;
};

/** Вариант мини-checkpoint (самопроверка, не graded test). */
export type CheckpointOption = {
  id: string;
  text: string;
  /** Образовательная подсказка при выборе; не раскрывает ответы контрольного теста. */
  feedback?: string;
};

/**
 * Мини-checkpoint из контента урока.
 * `correctAnswerId` / `correctOptionId` намеренно отсутствуют.
 */
export type CheckpointQuestion = {
  id: string;
  question: string;
  options: CheckpointOption[];
  explanation?: string;
};

/** Ссылка на соседний шаг курса (урок / тест / практика). */
export type LessonLink = {
  title: string;
  href: string;
  /** UI-статус шага hub, например completed | blocked | available */
  status?: string;
  disabled?: boolean;
  disabledReason?: string;
};

/**
 * @deprecated Используйте `LessonLink` (`title` вместо `label`, `disabledReason` вместо `hint`).
 */
export type LessonNavLink = LessonLink;

/**
 * Снимок урока для UI. Флаги `can*` — отображение по данным сервера;
 * повторная проверка при действиях остаётся в Server Actions / API.
 */
export type LessonViewModel = {
  id: string;
  title: string;
  description?: string;
  content: string;
  moduleId: string;
  moduleTitle: string;
  moduleNumber?: number;
  lessonNumber?: number;
  estimatedMinutes?: number;
  status: LessonStatus;
  objectives: LessonObjective[];
  keyTerms: KeyTerm[];
  checkpoints: CheckpointQuestion[];
  previousLesson?: LessonLink | null;
  nextLesson?: LessonLink | null;
  nextTest?: LessonLink | null;
  nextPractice?: LessonLink | null;
  canMarkComplete: boolean;
  canAccessTest: boolean;
  canAccessPractice: boolean;
  /** Причина блокировки урока или модуля (если status === locked). */
  lockedReason?: string;
};

/** Заголовок ссылки навигации (совместимость со старым `label`). */
export function lessonLinkTitle(link: LessonLink): string {
  return link.title;
}

/** Подсказка при disabled-ссылке. */
export function lessonLinkDisabledReason(link: LessonLink): string | undefined {
  return link.disabledReason;
}

/** Совместимость с `LearningStepLink` (sticky CTA, соседи hub). */
export function lessonLinkAsLearningStep(
  link: LessonLink,
): { label: string; href: string; disabled: boolean; hint?: string } {
  return {
    label: link.title,
    href: link.href,
    disabled: Boolean(link.disabled),
    hint: link.disabledReason,
  };
}
