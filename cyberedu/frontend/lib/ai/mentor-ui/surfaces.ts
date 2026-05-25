import type { MentorContextLabels } from "@/lib/ai/mentor-ui/types";

/** Где открыта панель наставника — влияет на набор режимов и строгость policy. */
export type MentorSurface =
  | "lesson"
  | "practice"
  | "test_result"
  | "dashboard"
  | "standalone";

export function resolveMentorSurface(opts: {
  lessonId?: string | null;
  practicalTaskId?: string | null;
  moduleId?: string | null;
  labels?: MentorContextLabels;
  /** Явная страница /mentor без привязки к уроку. */
  standalone?: boolean;
}): MentorSurface {
  if (opts.standalone) return "standalone";
  if (opts.practicalTaskId) return "practice";
  if (opts.lessonId) return "lesson";
  if (opts.labels?.testSummary?.trim()) return "test_result";
  if (opts.moduleId) return "dashboard";
  return "standalone";
}

export const MENTOR_SURFACE_LABELS: Record<MentorSurface, string> = {
  lesson: "Урок",
  practice: "Практика",
  test_result: "Результат теста",
  dashboard: "Кабинет",
  standalone: "Наставник",
};
