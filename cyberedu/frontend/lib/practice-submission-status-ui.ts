import type { SubmissionStatus } from "@prisma/client";
import type { PracticeContentStatus } from "@/lib/module-content-list";

/** Статусы в терминах курса (как в module-content-list). */
export type PracticeSubmissionDisplayStatus =
  | "not_started"
  | "submitted"
  | "pending_review"
  | "approved"
  | "needs_retry";

export function mapSubmissionToDisplayStatus(
  status: SubmissionStatus | null | undefined,
  practiceCompleted?: boolean,
): PracticeSubmissionDisplayStatus {
  if (practiceCompleted) return "approved";
  if (!status || status === "DRAFT") return "not_started";
  if (status === "ACCEPTED") return "approved";
  if (status === "SUBMITTED") return "submitted";
  if (status === "CHECKING") return "pending_review";
  if (status === "REJECTED" || status === "NEEDS_REVISION") return "needs_retry";
  return "not_started";
}

export const practiceSubmissionStatusMeta: Record<
  PracticeSubmissionDisplayStatus,
  { label: string; description: string; tone: "muted" | "warning" | "success" | "danger" }
> = {
  not_started: {
    label: "Не отправлено",
    description: "Выполните задание в рабочей области и отправьте ответ на проверку.",
    tone: "muted",
  },
  submitted: {
    label: "Отправлено",
    description: "Ответ принят системой и ожидает решения проверяющего. Новая попытка пока недоступна.",
    tone: "warning",
  },
  pending_review: {
    label: "На проверке",
    description: "Преподаватель или автоматическая система проверяет работу. Дождитесь статуса «Зачтено» или комментария.",
    tone: "warning",
  },
  approved: {
    label: "Зачтено",
    description: "Практика принята — можно перейти к следующему шагу программы.",
    tone: "success",
  },
  needs_retry: {
    label: "Нужны правки",
    description: "Учтите комментарий проверяющего, доработайте ответ и отправьте снова.",
    tone: "danger",
  },
};

/** Согласованность с PracticeContentStatus из списка модуля. */
export function displayStatusFromContentStatus(
  status: PracticeContentStatus,
): PracticeSubmissionDisplayStatus {
  if (status === "approved") return "approved";
  if (status === "submitted") return "submitted";
  if (status === "pending_review") return "pending_review";
  if (status === "needs_retry") return "needs_retry";
  return "not_started";
}
