/** Статусы отправки (совпадают с Prisma SubmissionStatus). */
export type PracticeReviewQueueStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "CHECKING"
  | "ACCEPTED"
  | "REJECTED"
  | "NEEDS_REVISION";

/** UI-фильтры очереди (не путать с Prisma SubmissionStatus). */
export type PracticeReviewFilterId = "pending_review" | "submitted" | "needs_retry";

export type PracticeReviewQueueItem = {
  id: string;
  studentId: string;
  studentLabel: string;
  practiceTitle: string;
  moduleTitle: string;
  submittedAt: string;
  status: PracticeReviewQueueStatus;
  statusLabel: string;
  reviewHref: string;
};

const STATUS_LABEL_RU: Record<PracticeReviewQueueStatus, string> = {
  DRAFT: "Черновик",
  SUBMITTED: "Отправлено",
  CHECKING: "На проверке",
  ACCEPTED: "Принято",
  REJECTED: "Отклонено",
  NEEDS_REVISION: "На доработку",
};

/** Приоритет в очереди: новые отправки выше. */
const STATUS_PRIORITY: Partial<Record<PracticeReviewQueueStatus, number>> = {
  SUBMITTED: 0,
  CHECKING: 1,
  NEEDS_REVISION: 2,
  REJECTED: 3,
};

export const PRACTICE_REVIEW_FILTER_OPTIONS: {
  id: PracticeReviewFilterId;
  label: string;
  submissionFilterQuery: string;
}[] = [
  { id: "pending_review", label: "На проверке", submissionFilterQuery: "pending" },
  { id: "submitted", label: "Отправлено", submissionFilterQuery: "submitted" },
  { id: "needs_retry", label: "Нужна доработка", submissionFilterQuery: "retry" },
];

export function practiceReviewStatusesForFilter(
  filter: PracticeReviewFilterId,
): PracticeReviewQueueStatus[] {
  switch (filter) {
    case "pending_review":
      return ["SUBMITTED", "CHECKING", "NEEDS_REVISION"];
    case "submitted":
      return ["SUBMITTED", "CHECKING"];
    case "needs_retry":
      return ["NEEDS_REVISION", "REJECTED"];
    default:
      return ["SUBMITTED", "CHECKING", "NEEDS_REVISION"];
  }
}

export function practiceReviewFilterListHref(filter: PracticeReviewFilterId): string {
  const q = PRACTICE_REVIEW_FILTER_OPTIONS.find((o) => o.id === filter)?.submissionFilterQuery ?? "pending";
  return `/admin/submissions?filter=${q}`;
}

export function practiceReviewStatusLabel(status: PracticeReviewQueueStatus): string {
  return STATUS_LABEL_RU[status] ?? status;
}

export function formatPracticeReviewStudentLabel(
  email: string,
  profile: { firstName: string; lastName: string; middleName: string | null } | null,
): string {
  if (!profile) return email;
  const mid = profile.middleName ? ` ${profile.middleName}` : "";
  const name = `${profile.lastName} ${profile.firstName}${mid}`.trim();
  return name || email;
}

export type PracticeReviewSubmissionRow = {
  id: string;
  status: PracticeReviewQueueStatus;
  updatedAt: Date;
  user: {
    id: string;
    email: string;
    profile: { firstName: string; lastName: string; middleName: string | null } | null;
  };
  practicalTask: { title: string; module: { title: string } };
};

/** Без textAnswer, fileUrl, adminComment — только обзор для очереди. */
export function mapSubmissionToPracticeReviewItem(row: PracticeReviewSubmissionRow): PracticeReviewQueueItem {
  return {
    id: row.id,
    studentId: row.user.id,
    studentLabel: formatPracticeReviewStudentLabel(row.user.email, row.user.profile),
    practiceTitle: row.practicalTask.title,
    moduleTitle: row.practicalTask.module.title,
    submittedAt: row.updatedAt.toISOString(),
    status: row.status,
    statusLabel: practiceReviewStatusLabel(row.status),
    reviewHref: `/admin/submissions/${row.id}`,
  };
}

export function sortPracticeReviewQueue(items: PracticeReviewQueueItem[]): PracticeReviewQueueItem[] {
  return [...items].sort((a, b) => {
    const pa = STATUS_PRIORITY[a.status] ?? 50;
    const pb = STATUS_PRIORITY[b.status] ?? 50;
    if (pa !== pb) return pa - pb;
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });
}

export function filterPracticeReviewItems(
  items: PracticeReviewQueueItem[],
  filter: PracticeReviewFilterId,
): PracticeReviewQueueItem[] {
  const allowed = new Set(practiceReviewStatusesForFilter(filter));
  return items.filter((item) => allowed.has(item.status));
}

export function searchPracticeReviewItems(
  items: PracticeReviewQueueItem[],
  query: string,
): PracticeReviewQueueItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    const hay = [item.studentLabel, item.practiceTitle, item.moduleTitle, item.statusLabel]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function statusBadgeVariant(
  status: PracticeReviewQueueStatus,
): "secondary" | "warning" | "primary" | "danger" | "success" {
  if (status === "SUBMITTED") return "primary";
  if (status === "CHECKING") return "warning";
  if (status === "NEEDS_REVISION" || status === "REJECTED") return "danger";
  if (status === "ACCEPTED") return "success";
  return "secondary";
}
