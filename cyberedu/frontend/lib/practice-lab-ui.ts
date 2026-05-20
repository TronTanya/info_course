import type { PracticalTaskType, SubmissionStatus } from "@prisma/client";
import { moduleDifficultyByOrder } from "@/lib/course-path-ui";

/** Визуальные статусы мини-лаборатории. */
export type PracticeLabState =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "passed"
  | "needs_review"
  | "wrong"
  | "correct";

export function getPracticeLabState(
  sub: { status: SubmissionStatus } | null,
  opts?: { hasDraft?: boolean; flash?: "correct" | "wrong" | null },
): PracticeLabState {
  if (sub?.status === "ACCEPTED") return "passed";
  if (opts?.flash === "correct") return "correct";
  if (opts?.flash === "wrong") return "wrong";
  if (!sub) return opts?.hasDraft ? "in_progress" : "not_started";

  switch (sub.status) {
    case "REJECTED":
      return "wrong";
    case "NEEDS_REVISION":
      return "needs_review";
    case "SUBMITTED":
    case "CHECKING":
      return "submitted";
    case "DRAFT":
      return "in_progress";
    default:
      return "in_progress";
  }
}

export const practiceLabStateMeta: Record<
  PracticeLabState,
  { label: string; tone: "muted" | "primary" | "success" | "danger" | "warning" }
> = {
  not_started: { label: "Не начато", tone: "muted" },
  in_progress: { label: "В процессе", tone: "primary" },
  submitted: { label: "Отправлено", tone: "warning" },
  passed: { label: "Зачёт", tone: "success" },
  needs_review: { label: "Нужны правки", tone: "warning" },
  wrong: { label: "Не засчитано", tone: "danger" },
  correct: { label: "Верно", tone: "success" },
};

export function practiceDifficultyLabel(moduleOrderNumber: number, maxScore: number): string {
  const base = moduleDifficultyByOrder(moduleOrderNumber);
  if (maxScore >= 15) return `${base} · высокий балл`;
  return base;
}

/** Ориентир времени на лабораторию (минуты). */
export function estimatePracticeMinutes(taskType: PracticalTaskType, maxScore: number): number {
  const byType: Partial<Record<PracticalTaskType, number>> = {
    PHISHING_ANALYSIS: 12,
    URL_ANALYSIS: 15,
    LOG_ANALYSIS: 18,
    TRAINING_CONSOLE: 15,
    INTERACTIVE: 12,
    CRYPTO_TASK: 14,
    FILE_UPLOAD: 20,
    COMBINED: 25,
    TEXT_ANSWER: 10,
  };
  const base = byType[taskType] ?? 12;
  if (maxScore >= 20) return base + 5;
  return base;
}

export function formatPracticeDuration(minutes: number): string {
  if (minutes < 60) return `~${minutes} мин`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h} ч ${m} мин` : `~${h} ч`;
}

export const practiceHintLevelLabels = [
  "Мягкая подсказка",
  "Направление",
  "Почти решение",
] as const;

export function practiceResultHeadline(status: SubmissionStatus | null, passed: boolean): string {
  if (passed || status === "ACCEPTED") return "Зачёт";
  if (status === "NEEDS_REVISION" || status === "REJECTED") return "Нужно улучшить";
  if (status === "SUBMITTED" || status === "CHECKING") return "На проверке";
  return "Результат";
}

export function statusRu(s: SubmissionStatus): string {
  const m: Record<SubmissionStatus, string> = {
    DRAFT: "Черновик",
    SUBMITTED: "Отправлено",
    CHECKING: "На проверке",
    ACCEPTED: "Принято",
    REJECTED: "Отклонено",
    NEEDS_REVISION: "Нужны правки",
  };
  return m[s] ?? s;
}

export function practiceImprovementTips(
  status: SubmissionStatus | null,
  adminComment: string | null,
): string[] {
  const tips: string[] = [];
  if (status === "NEEDS_REVISION" || status === "REJECTED") {
    tips.push("Вернитесь к лекции модуля и сверьте термины с формулировкой задания.");
    tips.push("Перечитайте сценарий и проверьте, что ответ закрывает все пункты критериев.");
    if (adminComment?.trim()) {
      tips.push(`Учтите комментарий проверяющего: «${adminComment.trim().slice(0, 200)}${adminComment.length > 200 ? "…" : ""}».`);
    } else {
      tips.push("Уточните логику шагов в отчёте — что проверяли и к какому выводу пришли.");
    }
  } else if (status === "SUBMITTED" || status === "CHECKING") {
    tips.push("Дождитесь проверки — при необходимости преподаватель оставит комментарий.");
  } else if (status === "ACCEPTED") {
    tips.push("Закрепите навык в следующем модуле или повторите лабораторию для тренировки.");
  }
  return tips;
}
