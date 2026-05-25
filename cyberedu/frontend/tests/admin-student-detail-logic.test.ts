import { describe, expect, it } from "vitest";
import {
  buildAdminStudentRecentActivity,
  studentSubmissionsQueueHref,
  submissionStatusLabelRu,
} from "@/lib/admin-student-detail-logic";

describe("admin-student-detail-logic", () => {
  it("builds recent activity without draft submissions", () => {
    const items = buildAdminStudentRecentActivity({
      testAttempts: [
        {
          id: "a1",
          testTitle: "Тест 1",
          moduleTitle: "М1",
          score: 8,
          maxScore: 10,
          passed: true,
          createdAt: "2026-05-19T10:00:00.000Z",
        },
      ],
      submissions: [
        {
          id: "s1",
          taskTitle: "Практика",
          moduleTitle: "М1",
          status: "SUBMITTED",
          createdAt: "2026-05-20T10:00:00.000Z",
          reviewHref: "/admin/submissions/s1",
        },
      ],
      certificates: [],
    });
    expect(items).toHaveLength(2);
    expect(items[0]?.kind).toBe("practice");
    expect(items[0]?.href).toBe("/admin/submissions/s1");
    expect(items[1]?.kind).toBe("test");
    expect(items[1]?.href).toBeNull();
  });

  it("student submissions href encodes user id", () => {
    expect(studentSubmissionsQueueHref("user/id")).toBe("/admin/submissions?student=user%2Fid");
  });

  it("labels submission status in Russian", () => {
    expect(submissionStatusLabelRu("NEEDS_REVISION")).toBe("На доработку");
  });
});
