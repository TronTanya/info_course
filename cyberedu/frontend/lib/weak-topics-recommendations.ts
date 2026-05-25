import {
  buildAiRecommendation,
  buildWeakTopicRecommendations,
  findFocusModule,
  resolveActiveModuleRow,
  type DashboardWeakTopic,
} from "@/lib/dashboard-ui";
import { buildWeakTopicMentorPrompt } from "@/lib/dashboard-ai-widget";
import {
  buildWeakTopicPanelItems,
  enrichWeakTopicForPanel,
  getFirstAvailableTestHref,
  type WeakTopicPanelItem,
} from "@/lib/weak-topics-panel";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

/** Идентификаторы реальных слабых тем (не проактивные подсказки). */
export const WEAK_TOPIC_RECORD_IDS = new Set([
  "weak-test",
  "weak-revision",
  "weak-rejected",
]);

export type DashboardLearningRecommendationKind = "lesson" | "test" | "practice" | "ai";

export type DashboardLearningRecommendation = {
  id: string;
  kind: DashboardLearningRecommendationKind;
  title: string;
  description: string;
  href?: string;
  /** Только для AI — безопасный промпт для чата наставника. */
  mentorPrompt?: string;
};

export function isRecordedWeakTopic(id: string): boolean {
  return WEAK_TOPIC_RECORD_IDS.has(id);
}

/** Слабые темы: только зафиксированные неуспехи (тест, доработка, отклонение). */
export function buildRecordedWeakTopics(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): WeakTopicPanelItem[] {
  return buildWeakTopicPanelItems(stats, modules)
    .filter((item) => isRecordedWeakTopic(item.id))
    .map((item) => ({
      ...item,
      ctaLabel: "Повторить",
    }));
}

function lessonGateMet(row: CourseProgressModuleRow): boolean {
  const { requirements: req, progress: p } = row;
  return !req.lessonRequired || Boolean(p?.lessonCompleted);
}

function testGateMet(row: CourseProgressModuleRow): boolean {
  const { requirements: req, progress: p } = row;
  return !req.testRequired || Boolean(p?.testCompleted);
}

/**
 * Карточки действий по текущему разблокированному модулю + AI.
 * Без выдуманной статистики; href только на открытые маршруты.
 */
export function buildLearningRecommendationCards(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardLearningRecommendation[] {
  if (modules.length === 0) return [];

  const recs: DashboardLearningRecommendation[] = [];
  const row = resolveActiveModuleRow(stats, modules) ?? findFocusModule(modules);

  if (row?.unlocked) {
    const base = `/dashboard/course/${row.module.id}`;
    const { requirements: req, progress: p } = row;
    const moduleTitle = row.module.title;

    if (req.lessonRequired) {
      recs.push({
        id: `rec-lesson-${row.module.id}`,
        kind: "lesson",
        title: "Повторить урок",
        description: p?.lessonCompleted
          ? `Закрепите материал модуля «${moduleTitle}» перед контролем`
          : `Продолжите лекцию в модуле «${moduleTitle}»`,
        href: `${base}/lesson`,
      });
    }

    if (req.testRequired && lessonGateMet(row) && !p?.testCompleted) {
      recs.push({
        id: `rec-test-${row.module.id}`,
        kind: "test",
        title: "Пройти тест",
        description: `Контроль знаний в модуле «${moduleTitle}»`,
        href: `${base}/test`,
      });
    }

    if (req.practiceRequired && lessonGateMet(row) && testGateMet(row) && !p?.practiceCompleted) {
      recs.push({
        id: `rec-practice-${row.module.id}`,
        kind: "practice",
        title: "Открыть практику",
        description: `Лабораторная работа модуля «${moduleTitle}»`,
        href: `${base}/practice`,
      });
    }
  }

  const ai = buildAiRecommendation(stats, modules);
  const weakForPrompt = buildWeakTopicRecommendations(stats, modules).filter((t) =>
    isRecordedWeakTopic(t.id),
  );
  const mentorPrompt =
    weakForPrompt.length > 0
      ? buildWeakTopicMentorPrompt(weakForPrompt[0]!.title)
      : "Помоги разобрать текущую тему курса — объясни проще и задай вопросы для самопроверки, без готовых ответов на тесты.";

  recs.push({
    id: "rec-ai",
    kind: "ai",
    title: "Спросить AI",
    description: ai.message,
    href: ai.mentorHref,
    mentorPrompt,
  });

  return recs;
}

export function buildWeakTopicsRecommendationsView(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): {
  weakTopics: WeakTopicPanelItem[];
  recommendations: DashboardLearningRecommendation[];
  firstTestHref: string | null;
} {
  const weakTopics = buildRecordedWeakTopics(stats, modules);
  const recommendations = buildLearningRecommendationCards(stats, modules);
  return {
    weakTopics,
    recommendations,
    firstTestHref: getFirstAvailableTestHref(modules),
  };
}

/** Есть ли что показать кроме полного empty state. */
export function hasWeakTopicsRecommendationsContent(
  weakTopics: WeakTopicPanelItem[],
  recommendations: DashboardLearningRecommendation[],
): boolean {
  return weakTopics.length > 0 || recommendations.length > 0;
}

/** Проактивные подсказки из dashboard-ui (не путать со слабыми темами). */
export function buildProactiveHints(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): WeakTopicPanelItem[] {
  return buildWeakTopicRecommendations(stats, modules)
    .filter((item) => !isRecordedWeakTopic(item.id))
    .map((item) => enrichWeakTopicForPanel(item, modules));
}

export type { DashboardWeakTopic, WeakTopicPanelItem };
