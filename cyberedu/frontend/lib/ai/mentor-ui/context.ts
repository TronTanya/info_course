import type { MentorContextKind, MentorContextLabels } from "@/lib/ai/mentor-ui/types";

export function resolveMentorContextKind(opts: {
  moduleId?: string | null;
  lessonId?: string | null;
  practicalTaskId?: string | null;
}): MentorContextKind {
  if (opts.practicalTaskId) return "practice";
  if (opts.lessonId) return "lesson";
  if (opts.moduleId) return "module";
  return "general";
}

export function buildContextChips(
  kind: MentorContextKind,
  labels: MentorContextLabels,
  moduleId?: string | null,
): { id: string; label: string }[] {
  const chips: { id: string; label: string }[] = [];
  if (labels.moduleTitle) chips.push({ id: "mod", label: labels.moduleTitle });
  else if (moduleId) chips.push({ id: "mod", label: "Модуль курса" });

  if (kind === "lesson" && labels.lessonTitle) {
    chips.push({ id: "les", label: labels.lessonTitle });
  } else if (kind === "lesson") {
    chips.push({ id: "les", label: "Лекция" });
  }

  if (kind === "practice" && labels.taskTitle) {
    chips.push({ id: "task", label: labels.taskTitle });
  } else if (kind === "practice") {
    chips.push({ id: "task", label: "Практика" });
  }

  return chips;
}
