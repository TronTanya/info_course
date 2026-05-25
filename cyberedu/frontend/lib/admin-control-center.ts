import { assertAdminDataAccess } from "@/lib/admin-access";
import { prisma } from "@/lib/db";
import {
  buildSystemStatusPanelData,
  type AdminSystemStatusPanel,
} from "@/lib/admin-system-status-panel";
import { countActiveStudentsInDateRange, countActiveStudentsSinceDays } from "@/lib/admin-dashboard";
import { getAdminLmsDashboardData, type AdminLmsDashboardData } from "@/lib/admin-lms-dashboard";
import { isSuspiciousAuditEvent } from "@/lib/admin-lms-audit";
import { runReadinessChecks } from "@/lib/health/readiness";
import { adminSafeErrorCode } from "@/lib/admin-ui-states";
import { logError } from "@/lib/log/structured";
import { getPracticeReviewQueue, type PracticeReviewQueueItem } from "@/lib/practice-review-queue";
import {
  buildCourseHealthPanelData,
  hasStudentLearningActivity,
  loadHighFailRateTests,
  loadProgressDropOffPoints,
  type CourseHealthPanelData,
} from "@/lib/course-health-panel";
import type { AdminHighFailTest } from "@/lib/course-health-panel-logic";
import { getContentManagementPreviewData, type ContentManagementPreviewData } from "@/lib/content-management-preview";
export type { AdminSystemStatusPanel, SystemStatusPanelData } from "@/lib/admin-system-status-panel";

export type AdminKpiTrendSnapshot = {
  direction: "up" | "down" | "neutral";
  label: string;
};

export type AdminControlCenterKpis = {
  totalStudents: number;
  activeStudents7d: number;
  averageProgressPercent: number | null;
  pendingSubmissions: number;
  certificatesIssued: number;
  failedLogins7d: number;
  securityEvents7d: number;
  /** Аудит в БД включён (SECURITY_AUDIT_DB ≠ 0). */
  auditLogAvailable: boolean;
  failedLogins24h: number;
  securityEvents24h: number;
  trends: {
    activeStudents7d?: AdminKpiTrendSnapshot;
    certificatesIssued7d?: AdminKpiTrendSnapshot;
    security24h?: AdminKpiTrendSnapshot;
  };
};

export type { AdminHighFailTest } from "@/lib/course-health-panel-logic";

export type AdminControlCenterData = AdminLmsDashboardData & {
  kpis: AdminControlCenterKpis;
  system: AdminSystemStatusPanel;
  highFailTests: AdminHighFailTest[];
  courseHealth: CourseHealthPanelData;
  contentManagement: ContentManagementPreviewData;
  practiceReviewQueue: PracticeReviewQueueItem[];
  /** true — очередь практик не загрузилась; остальной dashboard может отображаться. */
  reviewQueueLoadError: boolean;
};

function sinceDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function countAuditSince(actions: string[], since: Date, until?: Date): Promise<number> {
  if (process.env.SECURITY_AUDIT_DB === "0") return 0;
  const createdAt = until != null ? { gte: since, lt: until } : { gte: since };
  return prisma.securityAuditLog.count({
    where: {
      createdAt,
      action: actions.length === 1 ? actions[0] : { in: actions },
    },
  });
}

async function countSecurityEventsSince(since: Date, until?: Date): Promise<number> {
  if (process.env.SECURITY_AUDIT_DB === "0") return 0;
  const createdAt = until != null ? { gte: since, lt: until } : { gte: since };
  const rows = await prisma.securityAuditLog.findMany({
    where: { createdAt },
    select: { action: true, severity: true },
    take: 500,
  });
  return rows.filter((r) => isSuspiciousAuditEvent(r.action, r.severity)).length;
}

/** Данные главной админки — control center (без секретов и passwordHash). */
export async function getAdminControlCenterData(): Promise<AdminControlCenterData> {
  await assertAdminDataAccess();
  const [lms, activeStudents7d, checks, highFailTests, hasStudentActivity, progressDropOff] =
    await Promise.all([
      getAdminLmsDashboardData(),
      countActiveStudentsSinceDays(7),
      runReadinessChecks(),
      loadHighFailRateTests(),
      hasStudentLearningActivity(),
      loadProgressDropOffPoints(),
    ]);

  let practiceReviewQueue: PracticeReviewQueueItem[] = [];
  let reviewQueueLoadError = false;
  try {
    practiceReviewQueue = await getPracticeReviewQueue(60);
  } catch (error) {
    reviewQueueLoadError = true;
    logError("admin_review_queue_load_failed", { code: adminSafeErrorCode(error) });
  }

  const contentManagement = await getContentManagementPreviewData(lms.extended.content);

  const courseHealth = buildCourseHealthPanelData({
    hasStudentActivity,
    lowCompletionModules: lms.difficult.modules,
    highFailTests,
    difficultQuestions: lms.difficult.questions,
    progressDropOff,
    stuckPractices: lms.difficult.practices,
  });

  const since7 = sinceDays(7);
  const since14 = sinceDays(14);
  const since24h = sinceDays(1);
  const since48h = sinceDays(2);
  const auditLogAvailable = process.env.SECURITY_AUDIT_DB !== "0";

  const [
    failedLogins7d,
    securityEvents7d,
    failedLogins24h,
    securityEvents24h,
    activeStudentsPrev7d,
    certificatesLast7d,
    certificatesPrev7d,
    failedLoginsPrev24h,
    securityEventsPrev24h,
  ] = await Promise.all([
    countAuditSince(
      ["auth.login.failed", "auth.login.locked", "auth.login.rate_limited"],
      since7,
    ),
    countSecurityEventsSince(since7),
    countAuditSince(
      ["auth.login.failed", "auth.login.locked", "auth.login.rate_limited"],
      since24h,
    ),
    countSecurityEventsSince(since24h),
    countActiveStudentsInDateRange(since14, since7),
    prisma.certificate.count({ where: { issuedAt: { gte: since7 } } }),
    prisma.certificate.count({ where: { issuedAt: { gte: since14, lt: since7 } } }),
    countAuditSince(
      ["auth.login.failed", "auth.login.locked", "auth.login.rate_limited"],
      since48h,
      since24h,
    ),
    countSecurityEventsSince(since48h, since24h),
  ]);

  const trends: AdminControlCenterKpis["trends"] = {};
  const activeDelta = activeStudents7d - activeStudentsPrev7d;
  if (activeDelta !== 0) {
    trends.activeStudents7d = {
      direction: activeDelta > 0 ? "up" : "down",
      label: `${activeDelta > 0 ? "+" : ""}${activeDelta} к прошлой неделе`,
    };
  }

  const certDelta = certificatesLast7d - certificatesPrev7d;
  if (certDelta !== 0) {
    trends.certificatesIssued7d = {
      direction: certDelta > 0 ? "up" : "down",
      label: `${certDelta > 0 ? "+" : ""}${certDelta} за 7 дн.`,
    };
  }

  if (auditLogAvailable) {
    const secNow = failedLogins24h + securityEvents24h;
    const secPrev = failedLoginsPrev24h + securityEventsPrev24h;
    const secDelta = secNow - secPrev;
    if (secDelta !== 0) {
      trends.security24h = {
        direction: secDelta > 0 ? "up" : "down",
        label: `${secDelta > 0 ? "+" : ""}${secDelta} к прошлым суткам`,
      };
    }
  }

  return {
    ...lms,
    kpis: {
      totalStudents: lms.overview.totalStudents,
      activeStudents7d,
      averageProgressPercent:
        lms.overview.totalStudents > 0 ? lms.overview.averageProgressPercent : null,
      pendingSubmissions: lms.overview.pendingSubmissions,
      certificatesIssued: lms.overview.certificatesIssued,
      failedLogins7d,
      securityEvents7d,
      auditLogAvailable,
      failedLogins24h,
      securityEvents24h,
      trends,
    },
    system: buildSystemStatusPanelData(checks),
    highFailTests,
    courseHealth,
    practiceReviewQueue,
    contentManagement,
    reviewQueueLoadError,
  };
}
