import type { Metadata } from "next";

/** Заголовок главной админки (/admin). */
export const ADMIN_DASHBOARD_TITLE = "Админ-панель — CyberEdu" as const;

/** Общее описание раздела админки (без данных студентов и метрик). */
export const ADMIN_DASHBOARD_DESCRIPTION =
  "Управление курсом, студентами, практиками, сертификатами и аудитом CyberEdu." as const;

/** Приватный раздел: не индексировать в поисковиках. */
export const ADMIN_NOINDEX_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

/** Корневой metadata для `app/admin/layout.tsx`. */
export const adminRootMetadata: Metadata = {
  title: {
    default: ADMIN_DASHBOARD_TITLE,
    template: "%s — CyberEdu",
  },
  description: ADMIN_DASHBOARD_DESCRIPTION,
  robots: ADMIN_NOINDEX_ROBOTS,
};

/** Metadata главной панели `/admin` (control center). */
export const adminDashboardMetadata: Metadata = {
  title: { absolute: ADMIN_DASHBOARD_TITLE },
  description: ADMIN_DASHBOARD_DESCRIPTION,
  robots: ADMIN_NOINDEX_ROBOTS,
};

/** Metadata вложенной страницы админки (только статический заголовок, без PII). */
export function adminPageMetadata(pageTitle: string): Metadata {
  return {
    title: pageTitle,
    description: ADMIN_DASHBOARD_DESCRIPTION,
    robots: ADMIN_NOINDEX_ROBOTS,
  };
}
