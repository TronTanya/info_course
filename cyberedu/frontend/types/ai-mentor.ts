/**
 * View model и context model AI-наставника (ЭТАП 3).
 * Канонические типы для UI, API и pipeline — без секретов проверки и PII.
 */

export const AI_MENTOR_LOCALE = "ru" as const;

export type AIMentorLocale = typeof AI_MENTOR_LOCALE;

/** Режимы учебной панели наставника. */
export type AIMentorMode =
  | "explain_simple"
  | "give_example"
  | "check_understanding"
  | "summarize"
  | "hint_only"
  | "review_mistake"
  | "improve_reasoning";

export const AI_MENTOR_MODES = [
  "explain_simple",
  "give_example",
  "check_understanding",
  "summarize",
  "hint_only",
  "review_mistake",
  "improve_reasoning",
] as const satisfies readonly AIMentorMode[];

/** Источник контекста (где открыт наставник). */
export type AIMentorSourceType =
  | "lesson"
  | "test_result"
  | "practice"
  | "dashboard"
  | "general";

/**
 * Минимальный безопасный контекст для LLM.
 * Заполняется только через `mapToAIMentorContext` / серверный mapper.
 */
export type AIMentorContext = {
  sourceType: AIMentorSourceType;
  /** lessonId | practicalTaskId | moduleId — без путей и токенов. */
  sourceId?: string;
  moduleTitle?: string;
  lessonTitle?: string;
  practiceTitle?: string;
  testTitle?: string;
  safeTopic?: string;
  /** Очищенный фрагмент (лекция / описание задания), без rubric и ключей. */
  safeExcerpt?: string;
  /** Резюме сценария практики (role / context / goal), без solution и answerKey. */
  scenarioSummary?: string;
  /** Публичные инструкции студенту, без скрытой рубрики. */
  publicInstructions?: string;
  /** Темы для разбора после теста — только публичные названия, без answer keys. */
  weakTopics?: string[];
  /** Усвоенные темы по результату теста (без привязки к правильным вариантам). */
  strongTopics?: string[];
  /**
   * Черновик студента — только если явно разрешено политикой поверхности
   * (практика, режим improve_reasoning / check_understanding).
   */
  userDraft?: string;
  locale: AIMentorLocale;
};

export type AIMentorMessageRole = "user" | "assistant";

export type AIMentorMessage = {
  id: string;
  role: AIMentorMessageRole;
  content: string;
  createdAt: string;
  mode?: AIMentorMode;
};

export type AIMentorResponse = {
  message: AIMentorMessage;
  refusal?: boolean;
  safetyReason?: string;
  suggestions?: string[];
};

/** Частичный ввод с клиента — всегда прогонять через sanitize. */
export type AIMentorContextInput = Partial<
  Omit<AIMentorContext, "locale" | "sourceType">
> & {
  sourceType?: AIMentorSourceType;
  locale?: string;
};
