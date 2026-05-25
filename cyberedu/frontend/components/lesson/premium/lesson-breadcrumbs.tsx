import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  buildLessonBreadcrumbItems,
  LESSON_COURSE_HREF,
  type BuildLessonBreadcrumbItemsInput,
} from "@/lib/lesson-breadcrumbs-ui";
import { cn } from "@/lib/utils";

export type LessonBreadcrumbsProps = BuildLessonBreadcrumbItemsInput & {
  className?: string;
};

export function LessonBreadcrumbs({
  courseTitle,
  courseHref = LESSON_COURSE_HREF,
  moduleTitle,
  moduleId,
  lessonTitle,
  className,
}: LessonBreadcrumbsProps) {
  const items = buildLessonBreadcrumbItems({
    courseTitle,
    courseHref,
    moduleTitle,
    moduleId,
    lessonTitle,
  });

  return (
    <div
      className={cn(
        "ce-lesson-breadcrumbs ce-glass relative w-full max-w-none overflow-hidden rounded-xl border border-border/50",
        "bg-linear-to-r from-card/70 via-card/50 to-primary/[0.04] px-3 py-2.5 sm:px-4 sm:py-3",
        "shadow-[0_0_24px_-12px_hsl(var(--primary)/0.25)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-cyan/8 to-transparent"
        aria-hidden
      />
      <Breadcrumbs
        items={items}
        compact
        className="relative text-[11px] sm:text-sm"
        aria-label="Курс, модуль и урок"
      />
    </div>
  );
}
