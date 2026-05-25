import { describe, expect, it } from "vitest";
import {
  computeStudentsOverviewStatus,
  filterStudentsOverviewRows,
  mapAdminUserToStudentsOverviewRow,
  processStudentsOverviewList,
  searchStudentsOverviewRows,
  sortStudentsOverviewRows,
  STUDENTS_OVERVIEW_ACTIVE_DAYS,
} from "@/lib/students-overview-logic";
import type { AdminUserListRow } from "@/lib/admin-users-list";

function baseUser(overrides: Partial<AdminUserListRow> = {}): AdminUserListRow {
  return {
    id: "u1",
    email: "student@school.edu",
    role: "USER",
    fullName: "Иванов Иван",
    educationalInstitution: "ВУЗ",
    studyGroup: "КИ-25",
    studyCourseYear: "2",
    specialty: "ИБ",
    createdAt: "2026-01-01T00:00:00.000Z",
    overallProgressPercent: 40,
    totalScore: 100,
    hasCertificate: false,
    courseProgressRowCount: 1,
    testAttemptCount: 2,
    testsPassedCount: 1,
    practicesCompletedCount: 0,
    lastActivityAt: null,
    ...overrides,
  };
}

describe("students-overview-logic", () => {
  it("excludes admins from overview rows", () => {
    const row = mapAdminUserToStudentsOverviewRow(baseUser({ role: "ADMIN" }));
    expect(row).toBeNull();
  });

  it("marks completed when progress is 100%", () => {
    const now = new Date("2026-05-20T12:00:00.000Z");
    const status = computeStudentsOverviewStatus(
      { progressPercent: 100, lastActiveAt: null, hasCertificate: false },
      now,
    );
    expect(status).toBe("completed");
  });

  it("marks active when last activity within window", () => {
    const now = new Date("2026-05-20T12:00:00.000Z");
    const recent = new Date(now);
    recent.setDate(recent.getDate() - (STUDENTS_OVERVIEW_ACTIVE_DAYS - 1));
    const status = computeStudentsOverviewStatus(
      { progressPercent: 10, lastActiveAt: recent.toISOString(), hasCertificate: false },
      now,
    );
    expect(status).toBe("active");
  });

  it("filters and sorts overview list", () => {
    const rows = [
      {
        id: "a",
        displayName: "Борис",
        email: "b@test.ru",
        progressPercent: 20,
        lastActiveAt: "2026-05-01T00:00:00.000Z",
        status: "inactive" as const,
      },
      {
        id: "b",
        displayName: "Анна",
        email: "a@test.ru",
        progressPercent: 80,
        lastActiveAt: "2026-05-19T00:00:00.000Z",
        status: "active" as const,
      },
    ];
    const filtered = filterStudentsOverviewRows(rows, "active");
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("b");

    const sorted = sortStudentsOverviewRows(rows, "name");
    expect(sorted[0]?.displayName).toBe("Анна");

    const searched = searchStudentsOverviewRows(rows, "борис");
    expect(searched).toHaveLength(1);
  });

  it("paginates processed list", () => {
    const students = Array.from({ length: 12 }, (_, i) => ({
      id: `u${i}`,
      displayName: `Student ${i}`,
      email: `s${i}@t.ru`,
      progressPercent: i,
      lastActiveAt: null,
      status: "inactive" as const,
    }));
    const out = processStudentsOverviewList({
      rows: students,
      search: "",
      filter: "all",
      sort: "progress",
      page: 2,
      pageSize: 5,
    });
    expect(out.items).toHaveLength(5);
    expect(out.page).toBe(2);
    expect(out.totalPages).toBe(3);
  });
});
