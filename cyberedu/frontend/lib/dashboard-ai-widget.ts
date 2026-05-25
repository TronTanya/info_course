import { findFocusModule, buildWeakTopicRecommendations, type DashboardWeakTopic } from "@/lib/dashboard-ui";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import type { AIMentorContextInput } from "@/types/ai-mentor";
import { AI_MENTOR_LOCALE } from "@/types/ai-mentor";

export const DASHBOARD_MENTOR_PAGE_PATH = "/dashboard/mentor" as const;

export const DASHBOARD_AI_WIDGET_INTRO =
  "Поможет повторить тему, подготовиться к практике или разобраться с ошибками.";

export type DashboardAiWidgetQuickActionId =
  | "repeat_weak"
  | "explain_module"
  | "prepare_practice"
  | "learning_plan";

export type DashboardAiWidgetQuickAction = {
  id: DashboardAiWidgetQuickActionId;
  label: string;
  description: string;
  prompt: string;
};

export type DashboardAiWidgetPrompt = {
  id: string;
  label: string;
  text: string;
};

const FALLBACK_PROMPTS: DashboardAiWidgetPrompt[] = [
  {
    id: "start-course",
    label: "С чего начать курс?",
    text: "С чего начать курс?",
  },
  {
    id: "phishing",
    label: "Как распознавать фишинг?",
    text: "Как распознавать фишинг?",
  },
  {
    id: "prepare-practice",
    label: "Как подготовиться к практике?",
    text: "Как подготовиться к практике?",
  },
];

export function buildDashboardWeakTopics(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardWeakTopic[] {
  return buildWeakTopicRecommendations(stats, modules).slice(0, 4);
}

export function buildWeakTopicMentorPrompt(topicTitle: string): string {
  const title = topicTitle.trim();
  return title ? `Объясни тему: ${title}` : "Объясни тему, которую мне стоит повторить.";
}

function weakTopicPrompt(topic: DashboardWeakTopic): string {
  return buildWeakTopicMentorPrompt(topic.title);
}

export function buildDashboardAiWidgetQuickActions(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
  weakTopics: DashboardWeakTopic[],
): DashboardAiWidgetQuickAction[] {
  const focus = findFocusModule(modules);
  const moduleTitle =
    focus?.module.title ?? stats.currentModuleTitle ?? stats.courseTitle ?? "текущий модуль";
  const weak = weakTopics[0];

  return [
    {
      id: "explain_module",
      label: "Объяснить текущую тему",
      description: moduleTitle,
      prompt: `Объясни, о чём модуль «${moduleTitle}» и какие ключевые идеи нужно усвоить перед тестом. Без готовых ответов на проверки.`,
    },
    {
      id: "repeat_weak",
      label: "Повторить слабую тему",
      description: weak ? weak.title : "Когда появятся рекомендации",
      prompt: weak
        ? weakTopicPrompt(weak)
        : "Какие темы мне стоит повторить в первую очередь по моему прогрессу? Предложи план без спойлеров тестов.",
    },
    {
      id: "prepare_practice",
      label: "Подготовиться к практике",
      description: focus?.requirements.practiceRequired ? "Лаборатория модуля" : "Когда откроется практика",
      prompt:
        `Как подготовиться к практической лаборатории в модуле «${moduleTitle}»? ` +
        "Дай план анализа и на что обратить внимание, без готового решения задания.",
    },
    {
      id: "learning_plan",
      label: "Сделать план обучения",
      description: "На ближайшие дни",
      prompt:
        "Составь учебный план на ближайшую неделю: лекции, тесты и практика. " +
        "Учти, что я учусь в своём темпе, без жёстких дедлайнов.",
    },
  ];
}

export function buildDashboardAiWidgetSuggestedPrompts(
  weakTopics: DashboardWeakTopic[],
): DashboardAiWidgetPrompt[] {
  if (weakTopics.length === 0) return FALLBACK_PROMPTS;

  return weakTopics.slice(0, 3).map((topic) => ({
    id: `weak-${topic.id}`,
    label: buildWeakTopicMentorPrompt(topic.title),
    text: weakTopicPrompt(topic),
  }));
}

/** Безопасный контекст кабинета для POST /api/ai/chat (слабые темы — только названия). */
export function buildDashboardAIMentorContextInput(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
  weakTopics: DashboardWeakTopic[],
): AIMentorContextInput {
  const focus = findFocusModule(modules);
  const moduleTitle =
    focus?.module.title ?? stats.currentModuleTitle ?? stats.courseTitle ?? undefined;

  const weakLabels = weakTopics.map((t) => t.title).filter(Boolean);

  return {
    sourceType: "dashboard",
    sourceId: stats.currentModuleId ?? focus?.module.id ?? undefined,
    moduleTitle,
    safeTopic: moduleTitle,
    weakTopics: weakLabels.length ? weakLabels : undefined,
    locale: AI_MENTOR_LOCALE,
  };
}
