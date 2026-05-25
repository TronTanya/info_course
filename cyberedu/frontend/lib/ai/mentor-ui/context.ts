import type { MentorContextKind, MentorContextLabels } from "@/lib/ai/mentor-ui/types";

export function resolveMentorContextKind(
  opts: {
    moduleId?: string | null;
    lessonId?: string | null;
    practicalTaskId?: string | null;
  },
  labels?: MentorContextLabels,
): MentorContextKind {
  if (opts.practicalTaskId) return "practice";
  if (opts.lessonId) return "lesson";
  if (labels?.testSummary?.trim()) return "test";
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

  if (labels.testSummary) {
    chips.push({ id: "test", label: labels.testSummary });
  }

  if (labels.topic && labels.topic !== labels.moduleTitle && labels.topic !== labels.lessonTitle) {
    chips.push({ id: "topic", label: labels.topic });
  }

  return chips;
}

const kindShortLabel: Record<MentorContextKind, string> = {
  lesson: "Лекция",
  practice: "Практика",
  test: "Тест",
  module: "Модуль",
  general: "Кабинет",
};

/** Одна строка контекста для заголовка панели (без чипов). */
export function buildContextSubtitle(
  kind: MentorContextKind,
  labels: MentorContextLabels,
  moduleId?: string | null,
): string {
  const chips = buildContextChips(kind, labels, moduleId);
  if (chips.length === 0) return kindShortLabel[kind];
  return chips.map((c) => c.label).join(" · ");
}
