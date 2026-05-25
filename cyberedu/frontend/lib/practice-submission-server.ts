import { prisma } from "@/lib/db";
import {
  mapRowToPracticeSubmissionView,
  type PracticeSubmissionRow,
} from "@/lib/practice-submission-view";
import type { PracticeSubmissionView } from "@/types/practice-view-model";

export async function loadLatestPracticeSubmissionView(
  userId: string,
  practicalTaskId: string,
  maxScore: number,
): Promise<PracticeSubmissionView | undefined> {
  const row = await prisma.submission.findFirst({
    where: { userId, practicalTaskId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      score: true,
      adminComment: true,
      createdAt: true,
    },
  });
  if (!row) return undefined;
  return mapRowToPracticeSubmissionView(row as PracticeSubmissionRow, maxScore, {
    practiceCompleted: row.status === "ACCEPTED",
  });
}
