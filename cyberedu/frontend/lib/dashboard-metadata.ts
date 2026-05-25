import type { Metadata } from "next";

/** Заголовок главной страницы кабинета (без персональных данных). */
export const DASHBOARD_METADATA_TITLE = "Личный кабинет — CyberEdu";

export const DASHBOARD_METADATA_DESCRIPTION =
  "Прогресс обучения, практические задания, рекомендации и сертификат CyberEdu.";

const DASHBOARD_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

/** Базовые metadata для всего дерева `/dashboard` (приватная зона). */
export function buildDashboardRootMetadata(): Metadata {
  return {
    title: {
      default: DASHBOARD_METADATA_TITLE,
      template: "%s — CyberEdu",
    },
    description: DASHBOARD_METADATA_DESCRIPTION,
    robots: DASHBOARD_ROBOTS,
    openGraph: {
      title: DASHBOARD_METADATA_TITLE,
      description: DASHBOARD_METADATA_DESCRIPTION,
      type: "website",
    },
  };
}

/** Главная `/dashboard` — фиксированный title без подстановки template. */
export function buildDashboardHomeMetadata(): Metadata {
  return {
    title: { absolute: DASHBOARD_METADATA_TITLE },
    description: DASHBOARD_METADATA_DESCRIPTION,
    robots: DASHBOARD_ROBOTS,
  };
}

/** Внутренние страницы кабинета: только общий сегмент title (без имени пользователя). */
export function buildDashboardSectionMetadata(sectionTitle: string): Metadata {
  return {
    title: sectionTitle,
    description: DASHBOARD_METADATA_DESCRIPTION,
    robots: DASHBOARD_ROBOTS,
  };
}
