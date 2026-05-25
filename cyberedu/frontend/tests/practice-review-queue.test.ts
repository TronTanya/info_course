import { describe, expect, it } from "vitest";
import {
  filterPracticeReviewItems,
  mapSubmissionToPracticeReviewItem,
  practiceReviewStatusesForFilter,
  searchPracticeReviewItems,
  sortPracticeReviewQueue,
  type PracticeReviewQueueItem,
} from "@/lib/practice-review-queue-logic";

const sampleRow = {
  id: "sub-1",
  status: "SUBMITTED" as const,
  updatedAt: new Date("2026-05-20T12:00:00Z"),
  user: {
    id: "user-1",
    email: "s@test.local",
    profile: { firstName: "Иван", lastName: "Иванов", middleName: null },
  },
  practicalTask: { title: "Фишинг", module: { title: "Модуль 1" } },
};

describe("practice-review-queue", () => {
  it("maps row without answer fields", () => {
    const item = mapSubmissionToPracticeReviewItem(sampleRow);
    expect(item.studentLabel).toBe("Иванов Иван");
    expect(item.practiceTitle).toBe("Фишинг");
    expect(item.reviewHref).toBe("/admin/submissions/sub-1");
    expect(item).not.toHaveProperty("textAnswer");
    expect(item).not.toHaveProperty("adminComment");
  });

  it("filters pending_review statuses", () => {
    const items: PracticeReviewQueueItem[] = [
      { ...mapSubmissionToPracticeReviewItem(sampleRow), status: "SUBMITTED" },
      {
        ...mapSubmissionToPracticeReviewItem({ ...sampleRow, id: "2", status: "REJECTED" }),
        status: "REJECTED",
      },
    ];
    const pending = filterPracticeReviewItems(items, "pending_review");
    expect(pending).toHaveLength(1);
    expect(pending[0]?.status).toBe("SUBMITTED");
  });

  it("needs_retry includes revision and rejected", () => {
    const statuses = practiceReviewStatusesForFilter("needs_retry");
    expect(statuses).toContain("NEEDS_REVISION");
    expect(statuses).toContain("REJECTED");
  });

  it("search matches student and practice", () => {
    const item = mapSubmissionToPracticeReviewItem(sampleRow);
    expect(searchPracticeReviewItems([item], "фишинг")).toHaveLength(1);
    expect(searchPracticeReviewItems([item], "нет")).toHaveLength(0);
  });

  it("sorts SUBMITTED before REJECTED", () => {
    const sorted = sortPracticeReviewQueue([
      {
        ...mapSubmissionToPracticeReviewItem({ ...sampleRow, status: "REJECTED" }),
        status: "REJECTED",
      },
      mapSubmissionToPracticeReviewItem(sampleRow),
    ]);
    expect(sorted[0]?.status).toBe("SUBMITTED");
  });
});
