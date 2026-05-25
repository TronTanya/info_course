import { buildPracticeImprovementItems } from "@/lib/practice-feedback-revision-ui";
import { resolvePracticeViewStatus } from "@/lib/practice-view-mapper";
import { formatRuDateTimeFullUtc } from "@/lib/datetime-stable";
import type { PracticeSubmissionView, PracticeViewStatus } from "@/types/practice-view-model";
import type { SubmissionStatus } from "@prisma/client";

/** Статусы панели SubmissionStatusPanel (ETAP 13). */
export type SubmissionPanelStatus =
  | "submitted"
  | "pending_review"
  | "approved"
  | "needs_retry"
  | "rejected"
  | "locked";

export const SUBMISSION_STATUS_HEADLINES: Record<SubmissionPanelStatus, string> = {
  submitted: "Работа отправлена.",
  pending_review: "Работа ожидает проверки преподавателем.",
  approved: "Работа принята.",
  needs_retry: "Нужно доработать.",
  rejected: "Работа отклонена.",
  locked: "Практика заблокирована.",
};

export const SUBMISSION_STATUS_SUPPORTING: Partial<Record<SubmissionPanelStatus, string>> = {
  submitted: "Ответ сохранён. Новая отправка станет доступна после решения проверяющего.",
  pending_review: "Дождитесь статуса «Принято» или комментария преподавателя.",
  approved: "Можно перейти к следующему шагу программы.",
  needs_retry: "Учтите комментарий ниже и отправьте обновлённый ответ.",
  rejected:
    "Перечитайте инструкции и лекцию модуля. При повторном открытии практики отправьте новый ответ.",
  locked: "Сначала выполните предыдущие шаги модуля.",
};

const FEEDBACK_LEAK_PATTERNS: RegExp[] = [
  /grading\s*rubric/i,
  /hidden\s*rubric/i,
  /answer\s*key/i,
  /\bsolution\b/i,
  /auto\s*keywords/i,
  /explanation\s*pattern/i,
  /reflection\s*pattern/i,
  /correct\s*flag/i,
  /admin\s*only/i,
  /internal\s*note/i,
  /grader\s*note/i,
  /эталон/i,
  /скрыт(ая|ой)\s+рубрик/i,
  /внутренн/i,
  /regex\s*:/i,
];

const MAX_STUDENT_FEEDBACK_LENGTH = 1200;

export function isSubmissionPanelStatus(status: PracticeViewStatus): status is SubmissionPanelStatus {
  return (
    status === "submitted" ||
    status === "pending_review" ||
    status === "approved" ||
    status === "needs_retry" ||
    status === "rejected" ||
    status === "locked"
  );
}

export function practiceViewStatusFromSubmission(
  submissionStatus: SubmissionStatus | null | undefined,
  opts?: { practiceCompleted?: boolean; gateOk?: boolean },
): PracticeViewStatus {
  return resolvePracticeViewStatus({
    gateOk: opts?.gateOk ?? true,
    practiceCompleted: opts?.practiceCompleted,
    submissionStatus: submissionStatus ?? null,
  });
}

/** Безопасный текст feedback для студента (без admin-only и рубрик). */
export function sanitizeStudentFeedback(raw: string | null | undefined): string | undefined {
  const t = raw?.trim();
  if (!t || t.length < 2) return undefined;
  if (FEEDBACK_LEAK_PATTERNS.some((re) => re.test(t))) return undefined;
  const clipped = t.length > MAX_STUDENT_FEEDBACK_LENGTH ? `${t.slice(0, MAX_STUDENT_FEEDBACK_LENGTH)}…` : t;
  return clipped;
}

export function submissionPanelShowsFeedback(status: SubmissionPanelStatus): boolean {
  return status === "approved" || status === "needs_retry" || status === "rejected";
}

export function submissionPanelShowsScore(status: SubmissionPanelStatus): boolean {
  return status === "approved";
}

export type SubmissionStatusPanelModel = {
  status: SubmissionPanelStatus;
  headline: string;
  supporting?: string;
  lockedReason?: string;
  feedback?: string;
  improvementItems?: string[];
  score?: number;
  maxScore?: number;
  submittedAt?: string;
  submittedAtLabel?: string;
  showReviseCta: boolean;
};

export function buildSubmissionStatusPanelModel(input: {
  status: PracticeViewStatus;
  submission?: Pick<PracticeSubmissionView, "feedback" | "score" | "maxScore" | "submittedAt"> | null;
  lockedReason?: string | null;
  canRetry?: boolean;
}): SubmissionStatusPanelModel | null {
  if (!isSubmissionPanelStatus(input.status)) return null;

  const panelStatus = input.status;
  const feedbackRaw = input.submission?.feedback;
  const feedback =
    submissionPanelShowsFeedback(panelStatus) ? sanitizeStudentFeedback(feedbackRaw) : undefined;

  const score =
    submissionPanelShowsScore(panelStatus) && input.submission?.score != null
      ? input.submission.score
      : undefined;
  const maxScore =
    submissionPanelShowsScore(panelStatus) &&
    input.submission?.maxScore != null &&
    input.submission.maxScore > 0
      ? input.submission.maxScore
      : undefined;

  const submittedAt = input.submission?.submittedAt;
  const submittedAtLabel = submittedAt
    ? formatRuDateTimeFullUtc(submittedAt)
    : undefined;

  const improvementItems =
    panelStatus === "needs_retry" || panelStatus === "rejected"
      ? buildPracticeImprovementItems({ status: panelStatus, feedback })
      : undefined;

  return {
    status: panelStatus,
    headline: SUBMISSION_STATUS_HEADLINES[panelStatus],
    supporting:
      panelStatus === "locked"
        ? sanitizeStudentFeedback(input.lockedReason) ?? SUBMISSION_STATUS_SUPPORTING.locked
        : panelStatus === "pending_review"
          ? "Проверка преподавателя может занять время. Редактирование ответа недоступно до решения."
          : SUBMISSION_STATUS_SUPPORTING[panelStatus],
    lockedReason:
      panelStatus === "locked"
        ? sanitizeStudentFeedback(input.lockedReason) ?? input.lockedReason?.trim()
        : undefined,
    feedback,
    improvementItems,
    score,
    maxScore,
    submittedAt,
    submittedAtLabel,
    showReviseCta:
      panelStatus === "needs_retry" && Boolean(input.canRetry),
  };
}
