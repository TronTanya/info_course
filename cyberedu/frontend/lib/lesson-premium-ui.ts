import { buildLessonHeaderStatus } from "@/lib/lesson-header-ui";
import { formatLessonReadingTime } from "@/lib/module-content-list";
import type { LessonStatus } from "@/types/lesson-view-model";
import type { LessonSelfCheckItem } from "@/lib/lesson-page-ui";

export type LessonStatusTone = "completed" | "in_progress" | "not_started" | "locked";

export type LessonStatusView = {
  tone: LessonStatusTone;
  label: string;
  hint: string;
};

export function getLessonReadingTimeLabel(estimatedMinutes: number, hasVideo: boolean): string {
  return formatLessonReadingTime(estimatedMinutes, hasVideo);
}

export function getLessonStatusView(
  status: LessonStatus,
  readingPercent: number,
  lockedReason?: string | null,
): LessonStatusView {
  return buildLessonHeaderStatus(status, readingPercent, lockedReason);
}

export function limitSelfCheckItems(items: LessonSelfCheckItem[], max = 3): LessonSelfCheckItem[] {
  return items.slice(0, max);
}
