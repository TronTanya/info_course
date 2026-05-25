import type { SubmissionStatus } from "@prisma/client";

export type AdminSubmissionReviewIntent = "accept" | "reject" | "revision";

const INTENT_STATUS: Record<AdminSubmissionReviewIntent, SubmissionStatus> = {
  accept: "ACCEPTED",
  reject: "REJECTED",
  revision: "NEEDS_REVISION",
};

export function mapReviewIntentToStatus(intent: string): SubmissionStatus | null {
  const key = intent.trim() as AdminSubmissionReviewIntent;
  return INTENT_STATUS[key] ?? null;
}

export function reviewIntentRequiresConfirm(intent: AdminSubmissionReviewIntent): boolean {
  return intent === "accept" || intent === "reject" || intent === "revision";
}
