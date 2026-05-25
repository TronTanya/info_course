import type { SubmissionStatus } from "@prisma/client";
import { assertAdminDataAccess } from "@/lib/admin-access";
import { prisma } from "@/lib/db";
import {
  mapSubmissionToPracticeReviewItem,
  sortPracticeReviewQueue,
  type PracticeReviewQueueItem,
} from "@/lib/practice-review-queue-logic";

export type {
  PracticeReviewFilterId,
  PracticeReviewQueueItem,
  PracticeReviewSubmissionRow,
} from "@/lib/practice-review-queue-logic";

export {
  PRACTICE_REVIEW_FILTER_OPTIONS,
  filterPracticeReviewItems,
  formatPracticeReviewStudentLabel,
  mapSubmissionToPracticeReviewItem,
  practiceReviewFilterListHref,
  practiceReviewStatusesForFilter,
  practiceReviewStatusLabel,
  searchPracticeReviewItems,
  sortPracticeReviewQueue,
  statusBadgeVariant,
} from "@/lib/practice-review-queue-logic";

const QUEUE_SELECT = {
  id: true,
  status: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      profile: { select: { firstName: true, lastName: true, middleName: true } },
    },
  },
  practicalTask: { select: { title: true, module: { select: { title: true } } } },
} as const;

/** Последние / приоритетные работы для очереди проверки. */
export async function getPracticeReviewQueue(limit = 60): Promise<PracticeReviewQueueItem[]> {
  await assertAdminDataAccess();

  const statuses: SubmissionStatus[] = ["SUBMITTED", "CHECKING", "NEEDS_REVISION", "REJECTED"];

  const rows = await prisma.submission.findMany({
    where: { status: { in: statuses } },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: QUEUE_SELECT,
  });

  return sortPracticeReviewQueue(rows.map(mapSubmissionToPracticeReviewItem));
}
