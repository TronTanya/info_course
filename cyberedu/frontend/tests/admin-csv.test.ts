import { describe, expect, it } from "vitest";
import {
  assertCsvExportSafe,
  certificatesExportToCsv,
  progressExportToCsv,
  studentsExportToCsv,
  submissionsExportToCsv,
} from "@/lib/admin-csv";
import type { AdminUserListRow } from "@/lib/admin-users-list";

const minimalStudent: AdminUserListRow = {
  id: "u1",
  email: "student@example.com",
  role: "USER",
  fullName: "Иванов Иван",
  educationalInstitution: "ВУЗ",
  studyGroup: "КИ-25",
  studyCourseYear: "2",
  specialty: "ИБ",
  createdAt: "2026-01-01T00:00:00.000Z",
  overallProgressPercent: 40,
  totalScore: 10,
  hasCertificate: false,
  courseProgressRowCount: 0,
  testAttemptCount: 1,
  testsPassedCount: 0,
  practicesCompletedCount: 0,
  lastActivityAt: null,
};

describe("admin CSV export", () => {
  it("students CSV has no forbidden columns", () => {
    const csv = studentsExportToCsv([minimalStudent]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(() => assertCsvExportSafe(csv, "students")).not.toThrow();
    expect(csv.toLowerCase()).not.toContain("passwordhash");
  });

  it("progress and submissions use userId not email in header", () => {
    const progress = progressExportToCsv([
      {
        source: "platform",
        userId: "u1",
        moduleOrCourse: "М1",
        lesson: "Да",
        video: "Нет",
        test: "Нет",
        practice: "Нет",
        moduleDone: "Нет",
        score: "0",
        at: "1 янв.",
        groupName: "",
        college: "",
      },
    ]);
    const header = progress.split(/\r?\n/)[0] ?? "";
    expect(header).not.toMatch(/email/i);
    assertCsvExportSafe(progress, "progress");

    const submissions = submissionsExportToCsv([
      {
        id: "s1",
        userId: "u1",
        moduleTitle: "М1",
        taskTitle: "Задание",
        taskType: "CHECKLIST",
        status: "Принято",
        score: "10",
        submittedAt: "1 янв.",
        checkedAt: "",
      },
    ]);
    assertCsvExportSafe(submissions, "submissions");
    expect(submissions).not.toContain("textanswer");
  });

  it("certificates CSV excludes verification fields", () => {
    const csv = certificatesExportToCsv([
      {
        id: "c1",
        userId: "u1",
        certificateNumber: "CE-001",
        courseTitle: "ИБ",
        issuedAt: "1 янв. 2026",
      },
    ]);
    assertCsvExportSafe(csv, "certificates");
    expect(csv.toLowerCase()).not.toContain("verificationcode");
  });

  it("rejects unsafe header columns", () => {
    const bad = "\uFEFFpassword;email\r\nx;y";
    expect(() => assertCsvExportSafe(bad, "students")).toThrow(/forbidden column/i);
  });
});
