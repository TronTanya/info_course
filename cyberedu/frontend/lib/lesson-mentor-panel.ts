import type { LucideIcon } from "lucide-react";
import { BookOpen, FileText, HelpCircle, Lightbulb } from "lucide-react";
import type { MentorContextLabels } from "@/lib/ai/mentor-ui/types";
import type { MentorModeId } from "@/lib/ai/mentor-ui/modes";
export type LessonMentorSuggestedPrompt = { id: string; label: string; text: string };

/** Поля, которые нельзя передавать в панель / чат с клиента. */
export const LESSON_MENTOR_FORBIDDEN_CONTEXT_KEYS = [
  "correctAnswer",
  "correctAnswerId",
  "correctOptionId",
  "testAnswers",
  "practiceAnswers",
  "userEmail",
  "apiKey",
  "env",
] as const;

/** Безопасный контекст для AI (без ответов тестов, контента лекции и PII). */
export type LessonMentorSafeContext = {
  moduleId: string;
  lessonId: string;
  title: string;
  /** Тема модуля / раздела — для подписи в чате. */
  topic: string;
};

export type LessonMentorQuickActionId = "simpler" | "example" | "check" | "summary";

export type LessonMentorQuickAction = {
  id: LessonMentorQuickActionId;
  label: string;
  description: string;
  icon: LucideIcon;
  mentorModeId: MentorModeId;
  bootPrompt: string;
};

/** Режимы по умолчанию на странице урока (чат). */
export const LESSON_MENTOR_DEFAULT_MODE_IDS: MentorModeId[] = [
  "explain_simple",
  "give_example",
  "check_understanding",
  "summarize",
];

export const LESSON_MENTOR_INTRO =
  "Помогает разобраться в теме урока без раскрытия готовых ответов.";

export const LESSON_MENTOR_GUARDRAIL =
  "AI помогает учиться, но не выполняет задания за вас.";

export const LESSON_MENTOR_UNAVAILABLE = "AI-наставник сейчас недоступен.";

export const LESSON_MENTOR_LESSON_DISABLED =
  "Адаптация материала и чат наставника для этого урока отключены.";

export const LESSON_MENTOR_LOCKED_MESSAGE = "Откройте урок, чтобы получить помощь.";

/** Быстрые подсказки для чата на странице урока. */
export const LESSON_MENTOR_SUGGESTED_PROMPTS: LessonMentorSuggestedPrompt[] = [
  {
    id: "lesson-explain",
    label: "Проще",
    text: "Объясни этот урок простыми словами",
  },
  {
    id: "lesson-example",
    label: "Пример",
    text: "Приведи пример из жизни",
  },
  {
    id: "lesson-check",
    label: "Самопроверка",
    text: "Задай мне 3 вопроса для самопроверки",
  },
  {
    id: "lesson-summary",
    label: "Конспект",
    text: "Сделай краткий конспект",
  },
];

export const LESSON_MENTOR_QUICK_ACTIONS: LessonMentorQuickAction[] = [
  {
    id: "simpler",
    label: "Объясни проще",
    description: "Кратко и понятнее, без спойлеров проверки",
    icon: Lightbulb,
    mentorModeId: "explain_simple",
    bootPrompt: LESSON_MENTOR_SUGGESTED_PROMPTS[0]!.text,
  },
  {
    id: "example",
    label: "Приведи пример",
    description: "Безопасный кейс из кибербезопасности",
    icon: BookOpen,
    mentorModeId: "give_example",
    bootPrompt: LESSON_MENTOR_SUGGESTED_PROMPTS[1]!.text,
  },
  {
    id: "check",
    label: "Проверь понимание",
    description: "Вопросы для самопроверки, без ответов на тест",
    icon: HelpCircle,
    mentorModeId: "check_understanding",
    bootPrompt: LESSON_MENTOR_SUGGESTED_PROMPTS[2]!.text,
  },
  {
    id: "summary",
    label: "Сделай конспект",
    description: "Структурированное резюме урока",
    icon: FileText,
    mentorModeId: "summarize",
    bootPrompt: LESSON_MENTOR_SUGGESTED_PROMPTS[3]!.text,
  },
];

export function buildLessonMentorSafeContext(input: {
  moduleId: string;
  lessonId: string;
  title: string;
  moduleTitle: string;
}): LessonMentorSafeContext {
  return {
    moduleId: input.moduleId,
    lessonId: input.lessonId,
    title: input.title.trim() || "Урок",
    topic: input.moduleTitle.trim() || "Модуль",
  };
}

/** Проверка, что объект не содержит запрещённых ключей (для тестов и отладки). */
export function isLessonMentorContextSafe(value: unknown): value is LessonMentorSafeContext {
  if (!value || typeof value !== "object") return false;
  const keys = Object.keys(value as Record<string, unknown>);
  if (LESSON_MENTOR_FORBIDDEN_CONTEXT_KEYS.some((k) => keys.includes(k))) return false;
  const ctx = value as LessonMentorSafeContext;
  return (
    typeof ctx.moduleId === "string" &&
    typeof ctx.lessonId === "string" &&
    typeof ctx.title === "string" &&
    typeof ctx.topic === "string"
  );
}

/** Подписи для чата наставника — без контента лекции и без данных тестов. */
export function lessonMentorContextLabels(ctx: LessonMentorSafeContext): MentorContextLabels {
  return {
    lessonTitle: ctx.title,
    moduleTitle: ctx.topic,
    topic: ctx.topic,
  };
}
