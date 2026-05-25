import type { LessonStatus } from "@/types/lesson-view-model";

export type LessonHeaderStatusTone = "completed" | "in_progress" | "not_started" | "locked";

export type LessonHeaderStatusView = {
  tone: LessonHeaderStatusTone;
  label: string;
  hint: string;
};

/** Подписи статуса в шапке урока (этап 4). */
export const LESSON_HEADER_STATUS_LABELS: Record<LessonStatus, string> = {
  completed: "Завершено",
  in_progress: "В процессе",
  not_started: "Не начато",
  locked: "Заблокировано",
};

const DEFAULT_STATUS_HINTS: Record<LessonStatus, string> = {
  completed: "Можно перейти к тесту и практике модуля",
  in_progress: "Продолжайте чтение материала",
  not_started: "Откройте материал и пройдите мини-проверку в конце",
  locked: "Сначала завершите предыдущие шаги модуля",
};

export function buildLessonHeaderStatus(
  status: LessonStatus,
  readingPercent: number,
  lockedReason?: string | null,
): LessonHeaderStatusView {
  const label = LESSON_HEADER_STATUS_LABELS[status];

  if (status === "locked") {
    const reason = lockedReason?.trim();
    return {
      tone: "locked",
      label,
      hint: reason || DEFAULT_STATUS_HINTS.locked,
    };
  }

  if (status === "completed") {
    return { tone: "completed", label, hint: DEFAULT_STATUS_HINTS.completed };
  }

  if (status === "not_started") {
    return { tone: "not_started", label, hint: DEFAULT_STATUS_HINTS.not_started };
  }

  const hint =
    readingPercent >= 35
      ? `Прочитано примерно ${readingPercent}% материала`
      : DEFAULT_STATUS_HINTS.in_progress;

  return { tone: "in_progress", label, hint };
}

/** @deprecated Используйте `buildLessonHeaderStatus`. */
export function lessonStatusPresentation(
  status: LessonStatus,
  readingPercent: number,
  lockedReason?: string | null,
): LessonHeaderStatusView {
  return buildLessonHeaderStatus(status, readingPercent, lockedReason);
}
