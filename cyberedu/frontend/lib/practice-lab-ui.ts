import type { SubmissionStatus } from "@prisma/client";
import { moduleDifficultyByOrder } from "@/lib/course-path-ui";

export type PracticeLabState =
  | "not_started"
  | "in_progress"
  | "wrong"
  | "correct"
  | "completed"
  | "pending_review";

export function getPracticeLabState(
  sub: { status: SubmissionStatus } | null,
  opts?: { hasDraft?: boolean; flash?: "correct" | "wrong" | null },
): PracticeLabState {
  if (sub?.status === "ACCEPTED") return "completed";
  if (opts?.flash === "correct") return "correct";
  if (opts?.flash === "wrong") return "wrong";
  if (!sub) return opts?.hasDraft ? "in_progress" : "not_started";
  switch (sub.status) {
    case "REJECTED":
      return "wrong";
    case "NEEDS_REVISION":
      return "in_progress";
    case "SUBMITTED":
    case "CHECKING":
      return "pending_review";
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
  wrong: { label: "Ответ неверный", tone: "danger" },
  correct: { label: "Ответ верный", tone: "success" },
  completed: { label: "Завершено", tone: "success" },
  pending_review: { label: "На проверке", tone: "warning" },
};

export function practiceDifficultyLabel(moduleOrderNumber: number, maxScore: number): string {
  const base = moduleDifficultyByOrder(moduleOrderNumber);
  if (maxScore >= 15) return `${base} · высокий балл`;
  return base;
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
