import type { MentorContextKind } from "@/lib/ai/mentor-ui/types";

export type MentorModeId = "simpler" | "example" | "check" | "hint" | "plan";

export type MentorMode = {
  id: MentorModeId;
  label: string;
  description: string;
};

/** UI-режимы наставника — текст уходит как сообщение пользователя (не system prompt). */
export const MENTOR_MODES: MentorMode[] = [
  {
    id: "simpler",
    label: "Объясни проще",
    description: "Пересказ темы простыми словами",
  },
  {
    id: "example",
    label: "Дай пример",
    description: "Безопасный учебный пример",
  },
  {
    id: "check",
    label: "Проверь понимание",
    description: "Вопросы без спойлеров",
  },
  {
    id: "hint",
    label: "Дай подсказку",
    description: "Направление, не готовый ответ",
  },
  {
    id: "plan",
    label: "План повторения",
    description: "Шаги закрепления темы",
  },
];

function contextHint(kind: MentorContextKind): string {
  switch (kind) {
    case "lesson":
      return "по текущей лекции";
    case "practice":
      return "по текущей практике (без готового решения задания)";
    case "module":
      return "по текущему модулю курса";
    default:
      return "по кибербезопасности в учебном формате";
  }
}

export function buildMentorModePrompt(modeId: MentorModeId, kind: MentorContextKind): string {
  const ctx = contextHint(kind);
  switch (modeId) {
    case "simpler":
      return `Объясни проще ${ctx}: главную идею, 3–5 коротких тезисов и один проверочный вопрос мне.`;
    case "example":
      return `Приведи безопасный учебный пример ${ctx}. Без атакующих шагов и без готовых ответов на тест/практику.`;
    case "check":
      return `Проверь моё понимание ${ctx}: задай 2–3 наводящих вопроса и кратко скажи, на что обратить внимание.`;
    case "hint":
      return `Дай подсказку ${ctx}: только направление мысли и первый шаг, без полного решения и без ответов на проверку.`;
    case "plan":
      return `Составь план повторения ${ctx} на 20–30 минут: лекция, самопроверка, практика — без спойлеров.`;
    default:
      return `Помоги разобраться ${ctx} в учебном формате.`;
  }
}
