import { describe, expect, it } from "vitest";
import type { AdminControlCenterData } from "@/lib/admin-control-center";
import type { AdminUserListRow } from "@/lib/admin-users-list";
import {
  assertCleanAdminDashboardViewPayload,
  buildAdminDashboardViewModel,
  collectForbiddenAdminDashboardKeys,
} from "@/lib/admin-dashboard-view-mapper";
import { ADMIN_DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS } from "@/types/admin-dashboard-view-model";

function minimalCenter(over: Partial<AdminControlCenterData> = {}): AdminControlCenterData {
  const base = {
    stats: {
      totalUsers: 1,
      activeStudents: 1,
      pendingWorkCount: 0,
      certificatesIssuedTotal: 0,
      studentsCompletedCourse: 0,
    },
    extended: {
      content: {
        courseTitle: "Курс",
        modulesTotal: 1,
        lessonsTotal: 2,
        testsTotal: 3,
        practicesTotal: 4,
      },
      recent: [],
    },
    overview: {
      totalStudents: 5,
      activeStudents: 2,
      activeStudents30d: 3,
      averageProgressPercent: 40,
      averageTestPercent: null,
      practicesCompleted: 1,
      certificatesIssued: 2,
      pendingSubmissions: 1,
      studentsCompletedCourse: 0,
    },
    importantEvents: [],
    suspiciousEvents: [],
    difficult: { questions: [], modules: [], practices: [] },
    submissionQueue: [],
    certificates: {
      issuedTotal: 2,
      eligibleWithoutCert: 1,
      recent: [
        {
          id: "cert-1",
          certificateNumber: "CE-001",
          courseTitle: "Кибербезопасность",
          issuedAt: "2026-01-01T00:00:00.000Z",
          verifyHref: "/verify/abc",
          hasPdf: true,
        },
      ],
    },
    auditEvents: [
      {
        id: "a1",
        action: "auth.login.failed",
        actionLabel: "Неудачный вход",
        severity: "warn",
        at: "2026-01-02T00:00:00.000Z",
        actorLabel: "Система",
        path: null,
        sensitive: true,
        suspicious: true,
      },
    ],
    kpis: {
      totalStudents: 5,
      activeStudents7d: 2,
      averageProgressPercent: 40,
      pendingSubmissions: 1,
      certificatesIssued: 2,
      failedLogins7d: 0,
      securityEvents7d: 0,
      auditLogAvailable: true,
      failedLogins24h: 1,
      securityEvents24h: 0,
      trends: {},
    },
    system: {
      database: "ok" as const,
      ai: "disabled" as const,
      storage: "ok" as const,
    },
    highFailTests: [],
    courseHealth: {
      hasStudentActivity: true,
      lowCompletionModules: [
        {
          moduleId: "m1",
          title: "Модуль 1",
          completionPercent: 30,
          href: "/admin/modules/m1/edit",
        },
      ],
      highFailTests: [
        {
          testId: "t1",
          title: "Тест 1",
          moduleTitle: "Модуль 1",
          failRatePercent: 55,
          attempts: 10,
          href: "/admin/tests/t1/edit",
        },
      ],
      difficultTopics: [
        {
          topicId: "q1",
          topic: "Фишинг",
          moduleId: "m1",
          moduleTitle: "Модуль 1",
          mentionCount: 4,
          href: "/admin/modules/m1/edit",
        },
      ],
      dropOffPoints: [],
    },
    practiceReviewQueue: [
      {
        id: "sub-1",
        studentId: "u1",
        studentLabel: "Иван И.",
        practiceTitle: "Практика",
        moduleTitle: "Модуль",
        submittedAt: "2026-01-03T00:00:00.000Z",
        status: "SUBMITTED",
        statusLabel: "Отправлено",
        reviewHref: "/admin/submissions/sub-1",
      },
    ],
    contentManagement: {
      courseTitle: "Курс",
      counts: { modules: 1, lessons: 2, tests: 3, practices: 4 },
      drafts: { inactiveModules: 1, testsWithoutQuestions: 0 },
      routesConfigured: true,
      actions: [],
    },
    reviewQueueLoadError: false,
  };
  return { ...base, ...over } as AdminControlCenterData;
}

function studentUser(over: Partial<AdminUserListRow> = {}): AdminUserListRow {
  return {
    id: "u1",
    email: "student@example.com",
    role: "USER",
    fullName: "Иван Иванов",
    educationalInstitution: "—",
    studyGroup: "—",
    studyCourseYear: "—",
    specialty: "—",
    createdAt: "2025-01-01T00:00:00.000Z",
    overallProgressPercent: 50,
    totalScore: 0,
    hasCertificate: false,
    courseProgressRowCount: 1,
    testAttemptCount: 0,
    testsPassedCount: 0,
    practicesCompletedCount: 0,
    lastActivityAt: "2026-01-01T00:00:00.000Z",
    ...over,
  };
}

describe("admin dashboard view model", () => {
  it("ADMIN_DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS covers secrets and grading leaks", () => {
    expect(ADMIN_DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS).toContain("passwordHash");
    expect(ADMIN_DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS).toContain("answerKey");
    expect(ADMIN_DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS).toContain("verificationCode");
    expect(ADMIN_DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS).toContain("DATABASE_URL");
  });

  it("buildAdminDashboardViewModel maps control center shape", () => {
    const vm = buildAdminDashboardViewModel({
      center: minimalCenter(),
      users: [studentUser()],
    });

    expect(vm.kpis).toEqual({
      totalStudents: 5,
      activeStudents7d: 2,
      averageProgressPercentage: 40,
      pendingPracticeReviews: 1,
      issuedCertificates: 2,
      failedLogins24h: 1,
      securityEvents24h: 0,
    });

    expect(vm.reviewQueue[0]).toMatchObject({
      submissionId: "sub-1",
      studentId: "u1",
      studentDisplayName: "Иван И.",
      status: "submitted",
      href: "/admin/submissions/sub-1",
    });

    expect(vm.courseHealth.lowCompletionModules[0]?.moduleId).toBe("m1");
    expect(vm.students[0]).toMatchObject({
      id: "u1",
      displayName: "Иван Иванов",
      email: "student@example.com",
      progressPercentage: 50,
      status: "inactive",
      href: "/admin/users/u1",
    });

    expect(vm.contentSummary).toMatchObject({
      modulesCount: 1,
      lessonsCount: 2,
      testsCount: 3,
      practicesCount: 4,
      draftContentCount: 1,
    });

    expect(vm.certificates).toMatchObject({
      issuedCount: 2,
      readyCount: 1,
      recent: [{ id: "cert-1", href: "/verify/abc" }],
    });

    expect(vm.auditEvents[0]?.severity).toBe("critical");
    expect(vm.systemStatus?.database).toBe("ok");
    expect(vm.systemStatus?.ai).toBe("disabled");
  });

  it("omits security KPIs when audit log is unavailable", () => {
    const vm = buildAdminDashboardViewModel({
      center: minimalCenter({
        kpis: {
          ...minimalCenter().kpis,
          auditLogAvailable: false,
          failedLogins24h: 9,
          securityEvents24h: 9,
        },
      }),
      users: [],
    });
    expect(vm.kpis.failedLogins24h).toBeUndefined();
    expect(vm.kpis.securityEvents24h).toBeUndefined();
  });

  it("omits student email when includeStudentEmail is false", () => {
    const vm = buildAdminDashboardViewModel({
      center: minimalCenter(),
      users: [studentUser()],
      includeStudentEmail: false,
    });
    expect(vm.students[0]?.email).toBeUndefined();
  });

  it("collectForbiddenAdminDashboardKeys finds nested leaks", () => {
    const keys = collectForbiddenAdminDashboardKeys({
      kpis: { totalStudents: 1 },
      nested: { passwordHash: "x", reviewQueue: [] },
    });
    expect(keys).toContain("passwordHash");
  });

  it("assertCleanAdminDashboardViewPayload passes for built model", () => {
    const vm = buildAdminDashboardViewModel({
      center: minimalCenter(),
      users: [studentUser()],
    });
    expect(() => assertCleanAdminDashboardViewPayload(vm)).not.toThrow();
  });
});
