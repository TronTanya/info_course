import type { BreadcrumbItem } from "@/components/ui/breadcrumbs";

export const LESSON_COURSE_HREF = "/dashboard/course";

export function lessonModuleHref(moduleId: string): string {
  return `/dashboard/course/${moduleId}`;
}

export type BuildLessonBreadcrumbItemsInput = {
  courseTitle: string;
  courseHref?: string;
  moduleTitle: string;
  moduleId: string;
  lessonTitle: string;
};

/** Хлебные крошки урока: курс → модуль → урок (маршруты dashboard/course). */
export function buildLessonBreadcrumbItems(input: BuildLessonBreadcrumbItemsInput): BreadcrumbItem[] {
  const courseHref = input.courseHref ?? LESSON_COURSE_HREF;
  return [
    { label: input.courseTitle, href: courseHref },
    { label: input.moduleTitle, href: lessonModuleHref(input.moduleId) },
    { label: input.lessonTitle },
  ];
}
