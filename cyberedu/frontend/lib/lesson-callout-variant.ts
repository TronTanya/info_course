import type { LessonCalloutType } from "@/lib/lesson-callout-types";
import type { LessonSegment } from "@/components/lesson/lesson-structured-text";

/** Сопоставление сегментов парсера с визуальным типом callout. */
export function lessonSegmentCalloutVariant(seg: LessonSegment): LessonCalloutType | null {
  switch (seg.type) {
    case "info":
      return "info";
    case "ex":
    case "mini_case":
      return "example";
    case "warning":
      return "warning";
    case "danger":
      return "danger";
    case "checklist":
      return "checklist";
    case "remember":
    case "success":
    case "intro":
    case "how":
    case "tip":
      return "tip";
    case "why":
    case "outro":
      return "info";
    default:
      return null;
  }
}
