"use client";

import type { SubmissionStatus } from "@prisma/client";
import { SubmissionStatusPanel } from "@/components/practice/submission-status-panel";
import { practiceViewStatusFromSubmission, sanitizeStudentFeedback } from "@/lib/submission-status-panel";
import type { PracticeSubmissionView } from "@/types/practice-view-model";
import { cn } from "@/lib/utils";

export function PracticeLabSubmissionStrip({
  status,
  score,
  maxScore,
  createdAt,
  practiceCompleted,
  adminComment,
  lockedReason,
  canRetry,
  reviseWorkspaceId,
  className,
}: {
  status: SubmissionStatus | null;
  score: number | null;
  maxScore: number;
  createdAt?: string | null;
  practiceCompleted?: boolean;
  adminComment?: string | null;
  lockedReason?: string | null;
  canRetry?: boolean;
  reviseWorkspaceId?: string;
  className?: string;
}) {
  const viewStatus = practiceViewStatusFromSubmission(status, { practiceCompleted });
  const submission: PracticeSubmissionView | undefined =
    status && status !== "DRAFT"
      ? {
          id: "latest",
          status: viewStatus,
          submittedAt: createdAt ?? undefined,
          score: score ?? undefined,
          maxScore: maxScore > 0 ? maxScore : undefined,
          feedback: sanitizeStudentFeedback(adminComment),
        }
      : undefined;

  return (
    <SubmissionStatusPanel
      status={lockedReason ? "locked" : viewStatus}
      submission={submission}
      lockedReason={lockedReason}
      canRetry={canRetry}
      reviseWorkspaceId={reviseWorkspaceId}
      className={cn(className)}
    />
  );
}
