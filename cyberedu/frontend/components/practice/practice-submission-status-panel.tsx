"use client";

import { SubmissionStatusPanel } from "@/components/practice/submission-status-panel";
import type { PracticeSubmissionView } from "@/types/practice-view-model";

export type PracticeSubmissionStatusPanelProps = {
  submission: PracticeSubmissionView;
  lockedReason?: string | null;
  canRetry?: boolean;
  reviseWorkspaceId?: string;
  onRevise?: () => void;
  className?: string;
};

/** @deprecated Используйте SubmissionStatusPanel */
export function PracticeSubmissionStatusPanel({
  submission,
  lockedReason,
  canRetry,
  reviseWorkspaceId,
  onRevise,
  className,
}: PracticeSubmissionStatusPanelProps) {
  return (
    <SubmissionStatusPanel
      status={submission.status}
      submission={submission}
      lockedReason={lockedReason}
      canRetry={canRetry}
      reviseWorkspaceId={reviseWorkspaceId}
      onRevise={onRevise}
      className={className}
    />
  );
}
