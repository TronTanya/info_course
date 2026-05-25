import type { LucideIcon } from "lucide-react";
import { BookOpen, ClipboardList, HelpCircle, ListChecks } from "lucide-react";
import type { MentorContextLabels } from "@/lib/ai/mentor-ui/types";
import type { MentorModeId } from "@/lib/ai/mentor-ui/modes";

export type TestMentorSuggestedPrompt = { id: string; label: string; text: string };

/** Поля, которые нельзя передавать в панель / чат с клиента. */
export const TEST_MENTOR_FORBIDDEN_CONTEXT_KEYS = [
  "correctAnswer",
  "correctAnswerId",
  "correctOptionId",
  "answerKey",
  "testAnswers",
  "selectedAnswers",
  "selectedOptionId",
  "isCorrect",
  "scoringRules",
  "rawScoringRules",
  "solution",
  "hiddenExplanation",
] as const;

export type TestMentorSafeContext = {
  moduleId: string;
  testTitle: string;
  moduleTitle: string;
  percent: number;
  passed: boolean;
};

export type TestMentorQuickActionId = "review" | "weak_topic" | "study_plan" | "check";

export type TestMentorQuickAction = {
  id: TestMentorQuickActionId;
  label: string;
  description: string;
  icon: LucideIcon;
  mentorModeId: MentorModeId;
  bootPrompt: string;
};

/** Режимы на экране результата теста. */
export const TEST_MENTOR_DEFAULT_MODE_IDS: MentorModeId[] = [
  "review_mistake",
  "explain_simple",
  "summarize",
  "check_understanding",
];

export const TEST_MENTOR_INTRO =
  "Помогает разобрать пробелы после теста — без правильных вариантов и без спойлеров вопросов.";

export const TEST_MENTOR_GUARDRAIL =
  "AI помогает учиться, но не выполняет задания за вас.";

export const TEST_MENTOR_UNAVAILABLE = "AI-наставник сейчас недоступен.";

export const TEST_MENTOR_SUGGESTED_PROMPTS: TestMentorSuggestedPrompt[] = [
  {
    id: "test-explain-weak",
    label: "Тема ошибки",
    text: "Объясни тему, в которой я ошибился",
  },
  {
    id: "test-study-plan",
    label: "10 минут",
    text: "Составь план повторения на 10 минут",
  },
  {
    id: "test-quiz-weak",
    label: "Вопросы",
    text: "Задай мне вопросы по слабой теме",
  },
];

export const TEST_MENTOR_QUICK_ACTIONS: TestMentorQuickAction[] = [
  {
    id: "review",
    label: "Разобрать ошибку",
    description: "Почему могли быть пробелы — без правильных вариантов",
    icon: HelpCircle,
    mentorModeId: "review_mistake",
    bootPrompt: "Помоги разобрать мои ошибки после теста: типичные причины и как учиться дальше. Не называй правильные варианты ответов.",
  },
  {
    id: "weak_topic",
    label: "Повторить слабую тему",
    description: "Объяснение концепции по слабым темам из результата",
    icon: BookOpen,
    mentorModeId: "explain_simple",
    bootPrompt: TEST_MENTOR_SUGGESTED_PROMPTS[0]!.text,
  },
  {
    id: "study_plan",
    label: "Составить план повторения",
    description: "Короткий план: лекция → самопроверка → повтор",
    icon: ClipboardList,
    mentorModeId: "summarize",
    bootPrompt: TEST_MENTOR_SUGGESTED_PROMPTS[1]!.text,
  },
  {
    id: "check",
    label: "Проверить понимание",
    description: "2–3 вопроса по слабым темам без спойлеров",
    icon: ListChecks,
    mentorModeId: "check_understanding",
    bootPrompt: TEST_MENTOR_SUGGESTED_PROMPTS[2]!.text,
  },
];

export function buildTestMentorSafeContext(input: {
  moduleId: string;
  testTitle: string;
  moduleTitle: string;
  percent: number;
  passed: boolean;
}): TestMentorSafeContext {
  return {
    moduleId: input.moduleId,
    testTitle: input.testTitle.trim() || "Тест",
    moduleTitle: input.moduleTitle.trim() || "Модуль",
    percent: Math.max(0, Math.min(100, Math.round(input.percent))),
    passed: input.passed,
  };
}

export function testMentorContextLabels(ctx: TestMentorSafeContext): MentorContextLabels {
  const outcome = ctx.passed ? "зачтён" : "не зачтён";
  return {
    moduleTitle: ctx.moduleTitle,
    topic: ctx.moduleTitle,
    testSummary: `${ctx.testTitle} · ${ctx.percent}% · ${outcome}`,
  };
}
