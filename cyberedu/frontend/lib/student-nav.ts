import type { BreadcrumbItem } from "@/components/ui/breadcrumbs";

/** Хлебные крошки: кабинет → курс → модуль → текущий шаг. */
export function moduleStepBreadcrumbs(
  moduleId: string,
  moduleOrderNumber: number,
  currentLabel: string,
): BreadcrumbItem[] {
  return [
    { href: "/dashboard", label: "Кабинет" },
    { href: "/dashboard/course", label: "Курс" },
    { href: `/dashboard/course/${moduleId}`, label: `Модуль ${moduleOrderNumber}` },
    { label: currentLabel },
  ];
}

/** Кабинет → раздел личного кабинета. */
export function dashboardSectionBreadcrumbs(currentLabel: string): BreadcrumbItem[] {
  return [
    { href: "/dashboard", label: "Кабинет" },
    { label: currentLabel },
  ];
}
