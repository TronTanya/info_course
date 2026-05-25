import type { LucideIcon } from "lucide-react";
import { Compass, Eye, FileText, Lightbulb, Scale } from "lucide-react";
import type { MentorContextLabels } from "@/lib/ai/mentor-ui/types";
import type { MentorModeId } from "@/lib/ai/mentor-ui/modes";
import type { PracticalTaskType } from "@prisma/client";
import { practicalTaskTypeLabel } from "@/lib/ai/tutor/context/page-context";

/** Поля, которые нельзя передавать в AI-панель практики с клиента. */
export const PRACTICE_MENTOR_FORBIDDEN_CONTEXT_KEYS = [
  "solution",
  "solutionText",
  "answerKey",
  "correctFlagIds",
  "requiredIds",
  "reflectionPattern",
  "autoKeywords",
  "explanationPattern",
  "expected",
  "expectedCommand",
  "expectedAnswerPattern",
  "interactiveExpectedAnswer",
  "gradingRubric",
  "hiddenRubric",
  "scenarioData",
  "adminNotes",
  "internalNotes",
  "graderNotes",
  "rawScoringRules",
  "scoringRules",
  "privateStoragePath",
  "storagePath",
  "userEmail",
  "apiKey",
] as const;

const FORBIDDEN_SET = new Set<string>(PRACTICE_MENTOR_FORBIDDEN_CONTEXT_KEYS);

const EXCERPT_LEAK_PATTERNS: RegExp[] = [
  /grading\s*rubric/i,
  /hidden\s*rubric/i,
  /\banswer\s*key\b/i,
  /\bsolution\b/i,
  /correctflagids/i,
  /auto\s*keywords/i,
  /эталон/i,
];

export type PracticeMentorQuickActionId =
  | "explain_simpler"
  | "what_to_notice"
  | "check_argumentation"
  | "hint_no_answer"
  | "help_conclusion";

export type PracticeMentorQuickAction = {
  id: PracticeMentorQuickActionId;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Для подсветки режима в чате (опционально). */
  mentorModeId?: MentorModeId;
};

export const PRACTICE_MENTOR_GUARDRAIL =
  "AI помогает анализировать, но не выполняет лабораторию за вас.";

export const PRACTICE_MENTOR_INTRO =
  "Помогает разобрать задание и аргументацию без готового решения и без эталона проверки.";

export const PRACTICE_MENTOR_UNAVAILABLE = "AI-наставник сейчас недоступен.";

export const PRACTICE_MENTOR_MAX_ARGUMENT_EXCERPT = 2000;

/** Правила ответа AI на странице практики (отображение в панели). */
export const PRACTICE_MENTOR_ANSWER_RULES = [
  "Не решает лабораторию целиком и не пишет финальный ответ за вас.",
  "Может предложить план анализа, признаки для проверки и структуру ответа.",
  "Может задать уточняющие вопросы по вашему черновику.",
] as const;

export const PRACTICE_MENTOR_QUICK_ACTIONS: PracticeMentorQuickAction[] = [
  {
    id: "hint_no_answer",
    label: "Дай подсказку",
    description: "Только направление мысли",
    icon: Compass,
    mentorModeId: "hint_only",
  },
  {
    id: "explain_simpler",
    label: "Объясни задание проще",
    description: "Цель и шаги простыми словами",
    icon: Lightbulb,
    mentorModeId: "explain_simple",
  },
  {
    id: "what_to_notice",
    label: "На что обратить внимание?",
    description: "Признаки и критерии без спойлеров",
    icon: Eye,
  },
  {
    id: "help_conclusion",
    label: "Помоги оформить вывод",
    description: "Структура итогового текста",
    icon: FileText,
    mentorModeId: "improve_reasoning",
  },
  {
    id: "check_argumentation",
    label: "Проверь мою аргументацию",
    description: "Логика черновика без готового ответа",
    icon: Scale,
    mentorModeId: "check_understanding",
  },
];

export type PracticeMentorSafeContext = {
  moduleId: string;
  practicalTaskId: string;
  taskTitle: string;
  moduleTitle: string;
  taskTypeLabel: string;
  scenarioSummary?: string;
  publicInstructionsPreview?: string;
};

export type PracticeMentorChatBoot = {
  prompt: string;
  modeId?: MentorModeId;
};

export function buildPracticeMentorSafeContext(input: {
  moduleId: string;
  practicalTaskId: string;
  taskTitle: string;
  moduleTitle: string;
  taskType: PracticalTaskType;
  scenarioSummary?: string;
  publicInstructionsPreview?: string;
}): PracticeMentorSafeContext {
  return {
    moduleId: input.moduleId.trim(),
    practicalTaskId: input.practicalTaskId.trim(),
    taskTitle: input.taskTitle.trim() || "Практика",
    moduleTitle: input.moduleTitle.trim() || "Модуль",
    taskTypeLabel: practicalTaskTypeLabel(input.taskType),
    scenarioSummary: input.scenarioSummary,
    publicInstructionsPreview: input.publicInstructionsPreview,
  };
}

export function practiceMentorContextLabels(ctx: PracticeMentorSafeContext): MentorContextLabels {
  return {
    moduleTitle: ctx.moduleTitle,
    taskTitle: ctx.taskTitle,
    topic: ctx.taskTitle,
  };
}

/** Черновик ответа студента для проверки аргументации (только по явному действию). */
export function sanitizePracticeArgumentExcerpt(
  raw: string | null | undefined,
): string | undefined {
  const t = raw?.trim();
  if (!t || t.length < 8) return undefined;
  if (EXCERPT_LEAK_PATTERNS.some((re) => re.test(t))) return undefined;
  if (FORBIDDEN_SET.has(t.toLowerCase())) return undefined;
  return t.length > PRACTICE_MENTOR_MAX_ARGUMENT_EXCERPT
    ? `${t.slice(0, PRACTICE_MENTOR_MAX_ARGUMENT_EXCERPT)}…`
    : t;
}

export function buildPracticeMentorPrompt(
  actionId: PracticeMentorQuickActionId,
  opts?: { argumentExcerpt?: string | null },
): string {
  const excerpt = sanitizePracticeArgumentExcerpt(opts?.argumentExcerpt);

  switch (actionId) {
    case "explain_simpler":
      return (
        "Объясни формулировку этого практического задания проще: цель, что нужно сделать и в каком формате сдать ответ. " +
        "Без готового решения, без правильных вариантов и без ключей автопроверки."
      );
    case "what_to_notice":
      return (
        "На что мне обратить внимание при выполнении этой практики? Перечисли 4–6 ориентиров и типичные ошибки, " +
        "но не давай готовое решение и не раскрывай эталонные ответы."
      );
    case "check_argumentation":
      if (excerpt) {
        return (
          "Проверь мою аргументацию по этой практике. Ниже только мой черновик (без эталона). " +
          "Оцени логику, полноту и ясность; задай 1–2 уточняющих вопроса. Не давай готовое решение.\n\n" +
          `---\n${excerpt}\n---`
        );
      }
      return (
        "Проверь мою аргументацию по этой практике: я опишу ход мысли в следующем сообщении. " +
        "Оцени логику и связность, не давай готовое решение и не раскрывай ключи задания."
      );
    case "hint_no_answer":
      return (
        "Дай подсказку по этой практике без готового ответа: только направление и первый шаг анализа, " +
        "без полного решения и без перечисления правильных флагов или вариантов."
      );
    case "help_conclusion":
      return (
        "Помоги оформить вывод по этой практике: предложи структуру итогового текста (заголовки и пункты), " +
        "какие выводы уместны и чего избегать. Не пиши готовый ответ за меня."
      );
    default:
      return "Помоги с этой практикой в учебном формате, без готового решения на проверку.";
  }
}

export function buildPracticeMentorChatBoot(
  actionId: PracticeMentorQuickActionId,
  opts?: { argumentExcerpt?: string | null },
): PracticeMentorChatBoot {
  const action = PRACTICE_MENTOR_QUICK_ACTIONS.find((a) => a.id === actionId);
  return {
    prompt: buildPracticeMentorPrompt(actionId, opts),
    modeId: action?.mentorModeId,
  };
}

export function isPracticeMentorContextSafe(value: unknown): value is PracticeMentorSafeContext {
  if (!value || typeof value !== "object") return false;
  const keys = Object.keys(value as Record<string, unknown>);
  if (PRACTICE_MENTOR_FORBIDDEN_CONTEXT_KEYS.some((k) => keys.includes(k))) return false;
  const ctx = value as PracticeMentorSafeContext;
  return (
    typeof ctx.moduleId === "string" &&
    typeof ctx.practicalTaskId === "string" &&
    typeof ctx.taskTitle === "string" &&
    typeof ctx.moduleTitle === "string" &&
    typeof ctx.taskTypeLabel === "string"
  );
}
