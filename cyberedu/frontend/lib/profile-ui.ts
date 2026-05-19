import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import {
  buildWeakTopicRecommendations,
  getContinueFromModules,
  type DashboardWeakTopic,
} from "@/lib/dashboard-ui";
import type { CourseProgressModuleRow } from "@/lib/progress";

export type ProfileQuickAction = {
  id: "continue" | "certificate" | "weak";
  label: string;
  description: string;
  href: string;
  disabled?: boolean;
};

export function buildProfileQuickActions(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
  weakTopics: DashboardWeakTopic[],
): ProfileQuickAction[] {
  const continueTarget = getContinueFromModules(modules, stats.courseTitle);
  const weak = weakTopics[0];

  return [
    {
      id: "continue",
      label: "Продолжить обучение",
      description: continueTarget.hint,
      href: continueTarget.href,
    },
    {
      id: "certificate",
      label: "Открыть сертификат",
      description: stats.certificateIssued
        ? "Скачайте PDF или проверьте номер документа."
        : stats.allModulesComplete
          ? "Курс завершён — оформите сертификат."
          : `Осталось модулей: ${stats.modulesUntilCertificate}.`,
      href: "/dashboard/certificate",
    },
    {
      id: "weak",
      label: "Повторить слабые темы",
      description: weak
        ? weak.reason
        : "Пока нет рекомендаций — продолжайте по карте курса.",
      href: weak?.href ?? "/dashboard/course",
      disabled: weakTopics.length === 0,
    },
  ];
}

export function buildProfileWeakTopics(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardWeakTopic[] {
  return buildWeakTopicRecommendations(stats, modules).slice(0, 4);
}

export function certificateProgressLabel(stats: ProfileCourseStats): string {
  if (stats.certificateIssued) return "Сертификат выдан";
  if (stats.allModulesComplete) return "Готово к оформлению";
  if (stats.totalModules <= 0) return "Курс не настроен";
  return `${stats.completedModules} / ${stats.totalModules} модулей`;
}
