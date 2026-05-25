import type { AdminControlCenterData } from "@/lib/admin-control-center";
import type { AdminUserListRow } from "@/lib/admin-users-list";
import type { CourseHealthPanelData } from "@/lib/course-health-panel";
import type { ContentManagementPreviewData } from "@/lib/content-management-preview";
import { contentManagementDraftsTotal } from "@/lib/content-management-preview-logic";
import type { PracticeReviewQueueItem as LegacyPracticeReviewQueueItem } from "@/lib/practice-review-queue-logic";
import type { PracticeReviewQueueStatus } from "@/lib/practice-review-queue-logic";
import type { SystemStatusPanelData } from "@/lib/admin-system-status-panel";
import type { AdminCertificateSnapshot, AdminAuditEvent as LmsAdminAuditEvent } from "@/lib/admin-lms-dashboard";
import {
  mapAdminUserToStudentsOverviewRow,
  studentProfileAdminHref,
} from "@/lib/students-overview-logic";
import {
  ADMIN_DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS,
  type AdminAuditEvent,
  type AdminAuditSeverity,
  type AdminDashboardCertificateTeaser,
  type AdminCertificateSummary,
  type AdminContentSummary,
  type AdminDashboardViewModel,
  type AdminDashboardViewModelForbiddenKey,
  type AdminKpis,
  type AdminStudentSummary,
  type AdminSystemStatus,
  type CourseHealthDropOff,
  type CourseHealthModule,
  type CourseHealthSummary,
  type CourseHealthTest,
  type CourseHealthTopic,
  type PracticeReviewQueueItem,
  type AdminPracticeReviewStatus,
} from "@/types/admin-dashboard-view-model";

const FORBIDDEN_KEY_SET = new Set<string>(ADMIN_DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS);

function mapPracticeReviewUiStatus(status: PracticeReviewQueueStatus): AdminPracticeReviewStatus {
  if (status === "SUBMITTED") return "submitted";
  if (status === "CHECKING") return "pending_review";
  if (status === "NEEDS_REVISION" || status === "REJECTED") return "needs_retry";
  return "pending_review";
}

function mapLegacyPracticeReviewItem(item: LegacyPracticeReviewQueueItem): PracticeReviewQueueItem {
  return {
    submissionId: item.id,
    studentDisplayName: item.studentLabel,
    studentId: item.studentId,
    practiceTitle: item.practiceTitle,
    moduleTitle: item.moduleTitle,
    submittedAt: item.submittedAt,
    status: mapPracticeReviewUiStatus(item.status),
    href: item.reviewHref,
  };
}

function mapCourseHealth(panel: CourseHealthPanelData): CourseHealthSummary {
  const lowCompletionModules: CourseHealthModule[] = panel.lowCompletionModules.map((m) => ({
    moduleId: m.moduleId,
    title: m.title,
    completionPercent: m.completionPercent,
    href: m.href,
  }));

  const highFailRateTests: CourseHealthTest[] = panel.highFailTests.map((t) => ({
    testId: t.testId,
    title: t.title,
    moduleTitle: t.moduleTitle,
    failRatePercent: t.failRatePercent,
    attempts: t.attempts,
    href: t.href,
  }));

  const weakTopics: CourseHealthTopic[] = panel.difficultTopics.map((q) => ({
    topicId: q.topicId,
    topic: q.topic,
    moduleId: q.moduleId,
    moduleTitle: q.moduleTitle,
    mentionCount: q.mentionCount,
    href: q.href,
  }));

  const dropOffPoints: CourseHealthDropOff[] = panel.dropOffPoints.map((p) => ({
    id: p.id,
    kind: p.kind,
    kindLabel: p.kindLabel,
    title: p.title,
    moduleTitle: p.moduleTitle,
    stalledCount: p.stalledCount,
    href: p.href,
  }));

  return { lowCompletionModules, highFailRateTests, weakTopics, dropOffPoints };
}

function mapKpis(center: AdminControlCenterData): AdminKpis {
  const avg = center.kpis.averageProgressPercent;
  const kpis: AdminKpis = {
    totalStudents: center.kpis.totalStudents,
    activeStudents7d: center.kpis.activeStudents7d,
    averageProgressPercentage: avg ?? 0,
    pendingPracticeReviews: center.kpis.pendingSubmissions,
    issuedCertificates: center.kpis.certificatesIssued,
  };

  if (center.kpis.auditLogAvailable) {
    kpis.failedLogins24h = center.kpis.failedLogins24h;
    kpis.securityEvents24h = center.kpis.securityEvents24h;
  }

  return kpis;
}

function mapStudents(users: AdminUserListRow[], includeEmail: boolean): AdminStudentSummary[] {
  return users
    .map((row) => {
      const overview = mapAdminUserToStudentsOverviewRow(row);
      if (!overview) return null;
      const summary: AdminStudentSummary = {
        id: overview.id,
        displayName: overview.displayName,
        progressPercentage: overview.progressPercent,
        status: overview.status,
        href: studentProfileAdminHref(overview.id),
      };
      if (overview.lastActiveAt) {
        summary.lastActiveAt = overview.lastActiveAt;
      }
      if (includeEmail) {
        summary.email = overview.email;
      }
      return summary;
    })
    .filter((r): r is AdminStudentSummary => r != null);
}

function mapContentSummary(content: ContentManagementPreviewData): AdminContentSummary {
  const summary: AdminContentSummary = {
    modulesCount: content.counts.modules,
    lessonsCount: content.counts.lessons,
    testsCount: content.counts.tests,
    practicesCount: content.counts.practices,
  };
  if (content.drafts) {
    summary.draftContentCount = contentManagementDraftsTotal(content.drafts);
  }
  return summary;
}

function mapCertificates(snapshot: AdminCertificateSnapshot): AdminCertificateSummary {
  const recent: AdminDashboardCertificateTeaser[] = snapshot.recent.map((c) => ({
    id: c.id,
    certificateNumber: c.certificateNumber,
    courseTitle: c.courseTitle,
    issuedAt: c.issuedAt,
    href: c.verifyHref,
  }));

  const out: AdminCertificateSummary = {
    issuedCount: snapshot.issuedTotal,
    recent,
  };
  if (snapshot.eligibleWithoutCert > 0) {
    out.readyCount = snapshot.eligibleWithoutCert;
  }
  return out;
}

function normalizeAuditSeverity(raw: string, suspicious: boolean): AdminAuditSeverity {
  const s = raw.toLowerCase();
  if (s === "critical" || s === "high" || s === "danger" || suspicious) return "critical";
  if (s === "warn" || s === "warning") return "warning";
  return "info";
}

function auditEventHref(path: string | null, suspicious: boolean): string | undefined {
  if (path && path.startsWith("/admin/")) return path;
  if (suspicious) return "/admin/profile";
  return undefined;
}

function mapAuditEvents(events: LmsAdminAuditEvent[]): AdminAuditEvent[] {
  return events.slice(0, 40).map((e) => ({
    id: e.id,
    type: e.action,
    actorDisplayName: e.actorLabel || undefined,
    action: e.actionLabel,
    createdAt: e.at,
    severity: normalizeAuditSeverity(e.severity, e.suspicious),
    href: auditEventHref(e.path, e.suspicious),
  }));
}

function mapSystemStatus(panel: SystemStatusPanelData): AdminSystemStatus {
  const out: AdminSystemStatus = {
    database: panel.database,
    ai: panel.ai,
    storage: panel.storage,
  };
  if (panel.redis !== undefined) out.redis = panel.redis;
  if (panel.lastBackupAt) out.lastBackupAt = panel.lastBackupAt;
  if (panel.lastSmokeTestAt) out.lastSmokeTestAt = panel.lastSmokeTestAt;
  return out;
}

export type BuildAdminDashboardViewModelInput = {
  center: AdminControlCenterData;
  users: AdminUserListRow[];
  /** Показывать email в списке студентов (как в StudentsOverview). */
  includeStudentEmail?: boolean;
};

/** Собирает безопасную UI-модель админки из control center (без секретов и ключей ответов). */
export function buildAdminDashboardViewModel(
  input: BuildAdminDashboardViewModelInput,
): AdminDashboardViewModel {
  const { center, users, includeStudentEmail = true } = input;

  return {
    kpis: mapKpis(center),
    reviewQueue: center.practiceReviewQueue.map(mapLegacyPracticeReviewItem),
    courseHealth: mapCourseHealth(center.courseHealth),
    students: mapStudents(users, includeStudentEmail),
    contentSummary: mapContentSummary(center.contentManagement),
    certificates: mapCertificates(center.certificates),
    auditEvents: mapAuditEvents(center.auditEvents),
    systemStatus: mapSystemStatus(center.system),
  };
}

/** Рекурсивный сбор запрещённых ключей (для тестов и санитайзера). */
export function collectForbiddenAdminDashboardKeys(
  value: unknown,
  found = new Set<string>(),
  depth = 0,
): AdminDashboardViewModelForbiddenKey[] {
  if (depth > 8 || value == null || typeof value !== "object") {
    return [...found] as AdminDashboardViewModelForbiddenKey[];
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectForbiddenAdminDashboardKeys(entry, found, depth + 1);
    }
    return [...found] as AdminDashboardViewModelForbiddenKey[];
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_KEY_SET.has(key)) {
      found.add(key);
    }
    collectForbiddenAdminDashboardKeys(child, found, depth + 1);
  }

  return [...found] as AdminDashboardViewModelForbiddenKey[];
}

export function assertCleanAdminDashboardViewPayload(value: unknown): void {
  const keys = collectForbiddenAdminDashboardKeys(value);
  if (keys.length > 0) {
    throw new Error(`Admin dashboard view model contains forbidden keys: ${keys.join(", ")}`);
  }
}
