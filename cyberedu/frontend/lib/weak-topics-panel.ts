import {
  buildWeakTopicRecommendations,
  type DashboardWeakTopic,
} from "@/lib/dashboard-ui";
import { DASHBOARD_EMPTY_COPY } from "@/lib/dashboard-empty-copy";
import { moduleDifficultyByOrder } from "@/lib/course-path-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";

export type WeakTopicPanelItem = {
  id: string;
  title: string;
  difficulty: string;
  reason: string;
  lessonTitle: string;
  lessonHref: string;
  ctaLabel: string;
  href: string;
  tone: "warning" | "info";
};

function moduleFromHref(href: string, modules: CourseProgressModuleRow[]): CourseProgressModuleRow | null {
  const match = href.match(/\/dashboard\/course\/([^/]+)/);
  if (!match?.[1]) return null;
  return modules.find((m) => m.module.id === match[1]) ?? null;
}

function lessonMeta(mod: CourseProgressModuleRow | null): { title: string; href: string } {
  if (!mod) {
    return { title: "Лекция модуля", href: "/dashboard/course" };
  }
  return {
    title: mod.module.title,
    href: `/dashboard/course/${mod.module.id}/lesson`,
  };
}

function ctaLabelForAction(href: string, kind: DashboardWeakTopic["id"] | string): string {
  if (kind === "weak-test" || kind === "upcoming-test") return "Повторить урок";
  if (href.includes("/lesson")) return "Повторить урок";
  if (href.includes("/test")) return "Повторить тест";
  if (href.includes("/practice")) return "Повторить практику";
  if (href.includes("/my-assignments")) return "Посмотреть отправку";
  return "Повторить тему";
}

/** Преобразует рекомендацию дашборда в карточку панели (без выдуманной аналитики). */
export function enrichWeakTopicForPanel(
  item: DashboardWeakTopic,
  modules: CourseProgressModuleRow[],
): WeakTopicPanelItem {
  const mod = moduleFromHref(item.href, modules);
  const lesson = lessonMeta(mod);
  const difficulty = mod ? moduleDifficultyByOrder(mod.module.orderNumber) : "—";

  let href = item.href;
  let reason = item.reason;

  if (item.id === "weak-test") {
    href = lesson.href;
    reason = item.reason;
  } else if (item.id === "upcoming-test") {
    href = item.href.includes("/lesson") ? item.href : lesson.href;
  } else if (item.id === "weak-score" && mod) {
    href = lesson.href;
  }

  return {
    id: item.id,
    title: item.title,
    difficulty,
    reason,
    lessonTitle: lesson.title,
    lessonHref: lesson.href,
    ctaLabel: ctaLabelForAction(href, item.id),
    href,
    tone: item.tone,
  };
}

export function buildWeakTopicPanelItems(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): WeakTopicPanelItem[] {
  return buildWeakTopicRecommendations(stats, modules).map((item) => enrichWeakTopicForPanel(item, modules));
}

/** Ссылка на первый доступный тест (для empty state). */
export function getFirstAvailableTestHref(modules: CourseProgressModuleRow[]): string | null {
  const row = modules.find((m) => m.unlocked && m.requirements.testRequired);
  return row ? `/dashboard/course/${row.module.id}/test` : null;
}

export const WEAK_TOPICS_EMPTY = {
  title: "Слабые темы",
  line1: DASHBOARD_EMPTY_COPY.no_recommendations.title,
  line2: DASHBOARD_EMPTY_COPY.no_recommendations.description,
} as const;
