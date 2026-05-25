import { describe, expect, it } from "vitest";
import {
  assertCsvExportSafe,
  certificatesExportToCsv,
  progressExportToCsv,
  studentsExportToCsv,
  submissionsExportToCsv,
} from "@/lib/admin-csv";
import { parseAdminExportType } from "@/lib/admin-export-types";

describe("admin CSV export", () => {
  it("parseAdminExportType accepts known types", () => {
    expect(parseAdminExportType("students")).toBe("students");
    expect(parseAdminExportType("PROGRESS")).toBe("progress");
    expect(parseAdminExportType("unknown")).toBeNull();
  });

  it("students CSV includes email only in student export headers", () => {
    const csv = studentsExportToCsv([
      {
        id: "u1",
        email: "a@b.c",
        role: "USER",
        fullName: "Test User",
        educationalInstitution: "ВУЗ",
        studyGroup: "КИ-1",
        studyCourseYear: "1",
        specialty: "ИБ",
        createdAt: "2026-01-01T00:00:00.000Z",
        overallProgressPercent: 10,
        totalScore: 5,
        hasCertificate: false,
        courseProgressRowCount: 0,
        testAttemptCount: 0,
        testsPassedCount: 0,
        practicesCompletedCount: 0,
        lastActivityAt: null,
      },
    ]);
    expect(csv).toContain("Email");
    assertCsvExportSafe(csv, "students");
    expect(csv.toLowerCase()).not.toContain("passwordhash");
  });

  it("submissions CSV omits answer bodies and uses user id", () => {
    const csv = submissionsExportToCsv([
      {
        id: "sub1",
        userId: "u1",
        moduleTitle: "М1",
        taskTitle: "Задание",
        taskType: "PASSWORD_ANALYSIS",
        status: "Принято",
        score: "10",
        submittedAt: "1 янв.",
        checkedAt: "",
      },
    ]);
    expect(csv).toContain("ID пользователя");
    expect(csv).not.toContain("textAnswer");
    assertCsvExportSafe(csv, "submissions");
  });

  it("certificates CSV has no verification code column", () => {
    const csv = certificatesExportToCsv([
      {
        id: "c1",
        userId: "u1",
        certificateNumber: "CE-001",
        courseTitle: "Курс",
        issuedAt: "1 янв. 2026",
      },
    ]);
    expect(csv).toContain("Номер сертификата");
    expect(csv.toLowerCase()).not.toContain("verification");
    assertCsvExportSafe(csv, "certificates");
  });

  it("progress CSV supports platform and external rows", () => {
    const csv = progressExportToCsv([
      {
        source: "platform",
        userId: "u1",
        moduleOrCourse: "Модуль 1",
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
    expect(csv).toContain("Источник");
    assertCsvExportSafe(csv, "progress");
  });
});
