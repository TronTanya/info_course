import type { ProfileCourseStats, ProfileRecentSubmission } from "@/lib/profile-course-stats";
import { sanitizeStudentFeedback } from "@/lib/submission-status-panel";
import type { DashboardPracticeStatusKind } from "@/types/dashboard-view-model";
import type { SubmissionStatus } from "@prisma/client";

export const PENDING_PRACTICE_PANEL_MAX = 5;
/** Недавно принятые работы показываем в превью (дней). */
export const RECENT_APPROVED_PRACTICE_DAYS = 14;

export const PENDING_PRACTICE_STATUS_LABELS: Record<
  Extract<DashboardPracticeStatusKind, "submitted" | "pending_review" | "needs_retry" | "approved">,
  string
> = {
  submitted: "Отправлено",
  pending_review: "Ожидает проверки",
  needs_retry: "Нужно доработать",
  approved: "Принято",
};

export const PENDING_PRACTICE_STATUS_CLASS: Record<
  Extract<DashboardPracticeStatusKind, "submitted" | "pending_review" | "needs_retry" | "approved">,
  string
> = {
  submitted: "border-cyan/35 bg-cyan/10 text-cyan",
  pending_review: "border-warning/45 bg-warning/15 text-warning",
  needs_retry: "border-danger/35 bg-danger/12 text-danger",
  approved: "border-success/40 bg-success/10 text-success",
};

export type PendingPracticePanelItem = {
  id: string;
  title: string;
  moduleTitle: string;
  status: DashboardPracticeStatusKind;
  statusLabel: string;
  submittedAt: string;
  href: string;
  /** Только санитизированный комментарий для студента. */
  studentFeedback?: string;
};

export function mapSubmissionToPendingPracticeStatus(
  status: SubmissionStatus,
): DashboardPracticeStatusKind | null {
  switch (status) {
    case "SUBMITTED":
      return "submitted";
    case "CHECKING":
      return "pending_review";
    case "NEEDS_REVISION":
    case "REJECTED":
      return "needs_retry";
    case "ACCEPTED":
      return "approved";
    case "DRAFT":
    default:
      return null;
  }
}

function panelStatusLabel(status: DashboardPracticeStatusKind): string {
  if (status === "rejected") return PENDING_PRACTICE_STATUS_LABELS.needs_retry;
  if (status in PENDING_PRACTICE_STATUS_LABELS) {
    return PENDING_PRACTICE_STATUS_LABELS[status as keyof typeof PENDING_PRACTICE_STATUS_LABELS];
  }
  return status;
}

function panelStatusClass(status: DashboardPracticeStatusKind): string {
  if (status === "rejected") return PENDING_PRACTICE_STATUS_CLASS.needs_retry;
  if (status in PENDING_PRACTICE_STATUS_CLASS) {
    return PENDING_PRACTICE_STATUS_CLASS[status as keyof typeof PENDING_PRACTICE_STATUS_CLASS];
  }
  return "border-border bg-muted/30 text-muted-foreground";
}

export function getPendingPracticeStatusClass(status: DashboardPracticeStatusKind): string {
  return panelStatusClass(status);
}

export function resolvePendingPracticeStudentFeedback(
  status: DashboardPracticeStatusKind,
  rawFeedback?: string | null,
): string | undefined {
  if (status !== "approved" && status !== "needs_retry" && status !== "rejected") {
    return undefined;
  }
  return sanitizeStudentFeedback(rawFeedback);
}

function isRecentlyApproved(atIso: string, nowMs: number): boolean {
  const at = Date.parse(atIso);
  if (!Number.isFinite(at)) return false;
  const windowMs = RECENT_APPROVED_PRACTICE_DAYS * 24 * 60 * 60 * 1000;
  return nowMs - at <= windowMs;
}

function shouldIncludeSubmission(
  row: ProfileRecentSubmission,
  nowMs: number,
): DashboardPracticeStatusKind | null {
  const status = mapSubmissionToPendingPracticeStatus(row.status);
  if (!status) return null;
  if (status === "approved" && !isRecentlyApproved(row.at, nowMs)) return null;
  return status;
}

export function buildPendingPracticePanelItems(
  stats: ProfileCourseStats,
  nowMs: number = Date.now(),
): PendingPracticePanelItem[] {
  const seen = new Set<string>();
  const items: PendingPracticePanelItem[] = [];

  for (const row of stats.recentSubmissions) {
    const status = shouldIncludeSubmission(row, nowMs);
    if (!status) continue;

    const key = `${row.moduleId}:${row.taskTitle}`;
    if (seen.has(key)) continue;
    seen.add(key);

    items.push({
      id: key,
      title: row.taskTitle,
      moduleTitle: row.moduleTitle,
      status,
      statusLabel: panelStatusLabel(status),
      submittedAt: row.at,
      href: `/dashboard/course/${row.moduleId}/practice`,
      ...(row.studentFeedback ? { studentFeedback: row.studentFeedback } : {}),
    });

    if (items.length >= PENDING_PRACTICE_PANEL_MAX) break;
  }

  return items;
}
