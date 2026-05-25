import type { SubmissionStatus } from "@prisma/client";
import { resolvePracticeViewStatus } from "@/lib/practice-view-mapper";
import type { PracticeSubmissionView, PracticeViewStatus } from "@/types/practice-view-model";

export type PracticeSubmissionRow = {
  id: string;
  status: SubmissionStatus;
  score: number | null;
  adminComment: string | null;
  createdAt: Date | string;
};

function submissionFeedbackAllowed(status: SubmissionStatus): boolean {
  return status === "ACCEPTED" || status === "REJECTED" || status === "NEEDS_REVISION";
}

/** Безопасный PracticeSubmissionView для клиента (без solution, paths, raw secrets). */
export function mapRowToPracticeSubmissionView(
  row: PracticeSubmissionRow,
  maxScore: number,
  opts?: { practiceCompleted?: boolean },
): PracticeSubmissionView {
  const viewStatus: PracticeViewStatus = resolvePracticeViewStatus({
    gateOk: true,
    practiceCompleted: opts?.practiceCompleted,
    submissionStatus: row.status,
  });

  const showFeedback = submissionFeedbackAllowed(row.status) && Boolean(row.adminComment?.trim());

  return {
    id: row.id,
    status: viewStatus,
    submittedAt:
      typeof row.createdAt === "string" ? row.createdAt : row.createdAt.toISOString(),
    feedback: showFeedback ? row.adminComment!.trim() : undefined,
    score: row.score ?? undefined,
    maxScore: maxScore > 0 ? maxScore : undefined,
    canEdit: false,
  };
}
