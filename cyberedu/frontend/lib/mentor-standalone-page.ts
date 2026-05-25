import {
  buildDashboardAIMentorContextInput,
  buildDashboardWeakTopics,
  DASHBOARD_MENTOR_PAGE_PATH,
} from "@/lib/dashboard-ai-widget";
import { buildDashboardMentorLabels } from "@/lib/ai/mentor-ui/dashboard-context";
import type { MentorContextLabels } from "@/lib/ai/mentor-ui/types";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { DashboardWeakTopic } from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import type { AIMentorContextInput } from "@/types/ai-mentor";
import { AI_MENTOR_LOCALE } from "@/types/ai-mentor";

export { DASHBOARD_MENTOR_PAGE_PATH };

export type MentorPageContextScope = "general" | "course" | "weak_topics";

export const MENTOR_PAGE_TITLE = "AI-наставник";

export const MENTOR_PAGE_DESCRIPTION =
  "Учебный помощник CyberEdu: объясняет темы, задаёт вопросы для самопроверки, помогает готовиться к практике и разбирать ошибки — без готовых ответов на тесты и без решения лабораторий за вас.";

export const MENTOR_PAGE_CAPABILITIES = [
  "Объяснение терминов и идей простым языком",
  "Безопасные примеры из повседневной ИБ-практики",
  "Вопросы для проверки понимания",
  "План повторения и подготовки к практике",
  "Разбор ошибок после теста без спойлеров ответов",
] as const;

export const MENTOR_PAGE_USAGE_RULES = [
  "Наставник не выдаёт готовые ответы на тесты и не решает практику целиком.",
  "Не раскрывает эталоны проверки, ключи заданий и скрытые критерии оценки.",
  "Помогает строить рассуждение, план анализа и структуру ответа.",
  "Не подсказывает вредоносные действия (взлом, эксплойты, обход проверок).",
  "При запросе «списать» предложит безопасный способ учиться.",
] as const;

/** Только безопасные учебные примеры (не показывать небезопасные запросы). */
export const MENTOR_STANDALONE_SAFE_EXAMPLES = [
  {
    id: "phishing-def",
    label: "Что такое фишинг",
    text: "Объясни, что такое фишинг",
  },
  {
    id: "check-link",
    label: "Проверка ссылки",
    text: "Как проверить подозрительную ссылку?",
  },
  {
    id: "https-quiz",
    label: "Вопросы по HTTPS",
    text: "Задай мне вопросы по теме HTTPS",
  },
  {
    id: "email-plan",
    label: "План анализа письма",
    text: "Помоги составить план анализа письма",
  },
  {
    id: "hash-vs-encrypt",
    label: "Хеш vs шифрование",
    text: "Объясни разницу между хешированием и шифрованием",
  },
] as const;

export type MentorPageContextOption = {
  scope: MentorPageContextScope;
  label: string;
  description: string;
  disabled?: boolean;
};

export function buildMentorPageContextOptions(
  stats: ProfileCourseStats | null,
  weakTopics: DashboardWeakTopic[],
): MentorPageContextOption[] {
  const courseLabel = stats?.courseTitle?.trim() || "Текущий курс";
  const moduleLabel = stats?.currentModuleTitle?.trim();

  return [
    {
      scope: "general",
      label: "Общий вопрос",
      description: "Теория и практика ИБ без привязки к модулю",
    },
    {
      scope: "course",
      label: "Текущий курс",
      description: moduleLabel ? `${courseLabel} · ${moduleLabel}` : courseLabel,
      disabled: !stats?.currentModuleId && !stats?.courseTitle,
    },
    {
      scope: "weak_topics",
      label: "Слабые темы",
      description:
        weakTopics.length > 0
          ? weakTopics
              .slice(0, 2)
              .map((t) => t.title)
              .join(" · ")
          : "Появятся после незачтённых тестов или доработок",
      disabled: weakTopics.length === 0,
    },
  ];
}

export function resolveDefaultMentorPageScope(
  stats: ProfileCourseStats | null,
  weakTopics: DashboardWeakTopic[],
): MentorPageContextScope {
  if (weakTopics.length > 0) return "weak_topics";
  if (stats?.currentModuleId || stats?.courseTitle) return "course";
  return "general";
}

export function buildMentorPageAIMentorContext(
  scope: MentorPageContextScope,
  stats: ProfileCourseStats | null,
  modules: CourseProgressModuleRow[],
  weakTopics: DashboardWeakTopic[],
): AIMentorContextInput | null {
  if (!stats && scope !== "general") return null;

  if (scope === "general") {
    return {
      sourceType: "general",
      safeTopic: "Кибербезопасность",
      locale: AI_MENTOR_LOCALE,
    };
  }

  if (!stats) return null;

  if (scope === "weak_topics") {
    return buildDashboardAIMentorContextInput(stats, modules, weakTopics);
  }

  return buildDashboardAIMentorContextInput(stats, modules, []);
}

export function buildMentorPageContextLabels(
  scope: MentorPageContextScope,
  stats: ProfileCourseStats | null,
  modules: CourseProgressModuleRow[],
): MentorContextLabels {
  if (scope === "general") {
    return { topic: "Общий вопрос", moduleTitle: "CyberEdu" };
  }
  if (!stats) return {};
  return buildDashboardMentorLabels(stats, modules);
}

export function mentorPageModuleId(
  scope: MentorPageContextScope,
  stats: ProfileCourseStats | null,
): string | undefined {
  if (scope === "general") return undefined;
  return stats?.currentModuleId ?? undefined;
}

export function buildMentorPageWeakTopics(
  stats: ProfileCourseStats | null,
  modules: CourseProgressModuleRow[],
): DashboardWeakTopic[] {
  if (!stats) return [];
  return buildDashboardWeakTopics(stats, modules);
}
