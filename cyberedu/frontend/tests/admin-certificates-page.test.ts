import { describe, expect, it } from "vitest";
import {
  assertNoForbiddenCertificateViewKeys,
  mapAdminCertificateRowToItem,
  mapEligibleRowToAdminCertificateItem,
} from "@/lib/certificate-view-model";
import type { AdminCertificateRow } from "@/lib/admin-certificates-list";
import type { AdminCertificateEligibleRow } from "@/lib/admin-certificate-eligible";

const issuedRow: AdminCertificateRow = {
  id: "cert-db-id",
  certificateNumber: "CE-2026-TEST",
  verificationCode: "secret-code-never-in-ui",
  issuedAt: new Date("2026-05-01T12:00:00.000Z"),
  pdfUrl: "/storage/cert.pdf",
  userEmail: "student@example.com",
  fullName: "Иванов Иван",
  courseTitle: "Основы ИБ",
  userId: "user-1",
  status: "active",
  verifyHref: "https://app.example/verify/CE-2026-TEST",
};

const eligibleRow: AdminCertificateEligibleRow = {
  userId: "user-2",
  studentLabel: "Петров Пётр",
  email: "petrov@example.com",
  courseId: "course-1",
  courseTitle: "Основы ИБ",
  completedModules: 3,
  totalModules: 3,
  studentHref: "/admin/users/user-2",
};

describe("admin certificates page view models", () => {
  it("maps issued row without forbidden secrets", () => {
    const item = mapAdminCertificateRowToItem(issuedRow);
    expect(item.certificateNumber).toBe("CE-2026-TEST");
    expect(item.status).toBe("issued");
    expect(item.verifyHref).toBeTruthy();
    assertNoForbiddenCertificateViewKeys(item);
    expect(JSON.stringify(item)).not.toContain("secret-code");
    expect(JSON.stringify(item)).not.toContain("student@example.com");
  });

  it("maps eligible row with issue context for server action", () => {
    const item = mapEligibleRowToAdminCertificateItem(eligibleRow);
    expect(item.status).toBe("ready");
    expect(item.issueUserId).toBe("user-2");
    expect(item.issueCourseId).toBe("course-1");
    assertNoForbiddenCertificateViewKeys(item);
  });
});
