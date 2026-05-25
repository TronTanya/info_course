import { prisma } from "@/lib/db";
import {
  countActiveStudentsSinceDays,
  getAdminDashboardExtended,
  getAdminDashboardStats,
  type AdminDashboardExtended,
  type AdminDashboardStats,
  type AdminRecentActivityItem,
} from "@/lib/admin-dashboard";
import { assertAdminDataAccess } from "@/lib/admin-access";
import {
  auditActionLabelRu,
  auditActorLabel,
  isSensitiveAuditAction,
  isSuspiciousAuditEvent,
} from "@/lib/admin-lms-audit";
import { certificateVerifyUrl } from "@/lib/certificate";

export type AdminLmsOverview = {
  totalStudents: number;
  activeStudents: number;
  /** Студенты с активностью за последние 30 дней. */
  activeStudents30d: number;
  averageProgressPercent: number;
  averageTestPercent: number | null;
  practicesCompleted: number;
  certificatesIssued: number;
  pendingSubmissions: number;
  studentsCompletedCourse: number;
};

export type AdminDifficultQuestion = {
  questionId: string;
  questionText: string;
  moduleId: string;
  moduleTitle: string;
  wrongCount: number;
  gradedCount: number;
};

export type AdminLowCompletionModule = {
  moduleId: string;
  title: string;
  orderNumber: number;
  completionRatePercent: number;
  completedCount: number;
  studentCount: number;
};

export type AdminStuckPractice = {
  taskId: string;
  title: string;
  moduleTitle: string;
  stuckCount: number;
  totalSubmissions: number;
  stuckRatePercent: number;
};

export type AdminSubmissionQueueItem = {
  id: string;
  studentLabel: string;
  email: string;
  moduleTitle: string;
  taskTitle: string;
  status: string;
  statusLabel: string;
  at: string;
  href: string;
};

export type AdminCertificateSnapshot = {
  issuedTotal: number;
  eligibleWithoutCert: number;
  recent: {
    id: string;
    certificateNumber: string;
    courseTitle: string;
    issuedAt: string;
    verifyHref: string;
    hasPdf: boolean;
  }[];
};

export type AdminAuditEvent = {
  id: string;
  action: string;
  actionLabel: string;
  severity: string;
  at: string;
  actorLabel: string;
  path: string | null;
  sensitive: boolean;
  suspicious: boolean;
};

export type AdminImportantEvent = {
  id: string;
  kind: "submission" | "registration" | "security";
  title: string;
  subtitle: string;
  at: string;
  href: string;
  tone: "default" | "warning";
};

export type AdminLmsDashboardData = {
  stats: AdminDashboardStats;
  extended: AdminDashboardExtended;
  overview: AdminLmsOverview;
  importantEvents: AdminImportantEvent[];
  suspiciousEvents: AdminAuditEvent[];
  difficult: {
    questions: AdminDifficultQuestion[];
    modules: AdminLowCompletionModule[];
    practices: AdminStuckPractice[];
  };
  submissionQueue: AdminSubmissionQueueItem[];
  certificates: AdminCertificateSnapshot;
  auditEvents: AdminAuditEvent[];
};

const STATUS_RU: Record<string, string> = {
  SUBMITTED: "Отправлено",
  CHECKING: "На проверке",
  ACCEPTED: "Принято",
  REJECTED: "Отклонено",
  NEEDS_REVISION: "На доработку",
};

function buildImportantEvents(
  recent: AdminRecentActivityItem[],
  suspicious: AdminAuditEvent[],
): AdminImportantEvent[] {
  const fromRecent: AdminImportantEvent[] = recent.map((r) => ({
    id: r.id,
    kind: r.kind === "user" ? "registration" : "submission",
    title: r.title,
    subtitle: r.subtitle,
    at: r.at,
    href: r.href,
    tone: "default",
  }));

  const fromSecurity: AdminImportantEvent[] = suspicious.slice(0, 4).map((e) => ({
    id: `audit-${e.id}`,
    kind: "security" as const,
    title: e.actionLabel,
    subtitle: `${e.actorLabel} · ${e.severity}`,
    at: e.at,
    href: "/admin/profile",
    tone: "warning" as const,
  }));

  return [...fromRecent, ...fromSecurity]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);
}

async function averageStudentProgressPercent(): Promise<number> {
  const activeModuleCount = await prisma.module.count({ where: { isActive: true } });
  if (activeModuleCount === 0) return 0;

  const completedByUser = await prisma.progress.groupBy({
    by: ["userId"],
    where: { moduleCompleted: true, module: { isActive: true }, user: { role: "USER" } },
    _count: { _all: true },
  });

  const studentCount = await prisma.user.count({ where: { role: "USER" } });
  if (studentCount === 0) return 0;

  const sumPct = completedByUser.reduce(
    (acc, row) => acc + Math.round((row._count._all / activeModuleCount) * 100),
    0,
  );
  const usersWithout = studentCount - completedByUser.length;
  return Math.round((sumPct + usersWithout * 0) / studentCount);
}

async function averageTestPercent(): Promise<number | null> {
  const attempts = await prisma.testAttempt.findMany({
    where: { maxScore: { gt: 0 }, user: { role: "USER" } },
    select: { score: true, maxScore: true },
    take: 8000,
  });
  if (attempts.length === 0) return null;
  const sum = attempts.reduce((acc, a) => acc + (a.score / a.maxScore) * 100, 0);
  return Math.round(sum / attempts.length);
}

export async function getAdminLmsDashboardData(): Promise<AdminLmsDashboardData> {
  await assertAdminDataAccess();
  const [stats, extended, activeStudents30d] = await Promise.all([
    getAdminDashboardStats(),
    getAdminDashboardExtended(),
    countActiveStudentsSinceDays(30),
  ]);
  const studentCount = await prisma.user.count({ where: { role: "USER" } });

  const [
    averageProgressPercent,
    averageTestPercentVal,
    practicesCompleted,
    wrongAnswerGroups,
    activeModules,
    moduleCompletedGroups,
    rejectGroups,
    submissionTotals,
    pendingSubmissionRows,
    recentCerts,
    auditRows,
  ] = await Promise.all([
    averageStudentProgressPercent(),
    averageTestPercent(),
    prisma.progress.count({
      where: { practiceCompleted: true, user: { role: "USER" } },
    }),
    prisma.testAttemptAnswer.groupBy({
      by: ["questionId"],
      where: { isCorrect: false },
      _count: { _all: true },
    }),
    prisma.module.findMany({
      where: { isActive: true },
      orderBy: { orderNumber: "asc" },
      select: { id: true, title: true, orderNumber: true },
    }),
    prisma.progress.groupBy({
      by: ["moduleId"],
      where: { moduleCompleted: true, user: { role: "USER" } },
      _count: { _all: true },
    }),
    prisma.submission.groupBy({
      by: ["practicalTaskId"],
      where: { status: { in: ["SUBMITTED", "CHECKING", "NEEDS_REVISION", "REJECTED"] } },
      _count: { _all: true },
    }),
    prisma.submission.groupBy({
      by: ["practicalTaskId"],
      where: { status: { not: "DRAFT" } },
      _count: { _all: true },
    }),
    prisma.submission.findMany({
      where: { status: { in: ["SUBMITTED", "CHECKING", "NEEDS_REVISION"] } },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        status: true,
        updatedAt: true,
        user: {
          select: {
            email: true,
            profile: { select: { firstName: true, lastName: true, middleName: true } },
          },
        },
        practicalTask: { select: { title: true, module: { select: { title: true } } } },
      },
    }),
    prisma.certificate.findMany({
      orderBy: { issuedAt: "desc" },
      take: 5,
      select: {
        id: true,
        certificateNumber: true,
        verificationCode: true,
        issuedAt: true,
        pdfUrl: true,
        course: { select: { title: true } },
      },
    }),
    process.env.SECURITY_AUDIT_DB === "0"
      ? Promise.resolve([])
      : prisma.securityAuditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 40,
          select: {
            id: true,
            action: true,
            severity: true,
            createdAt: true,
            actorId: true,
            path: true,
            targetId: true,
          },
        }),
  ]);

  const overview: AdminLmsOverview = {
    totalStudents: studentCount,
    activeStudents: stats.activeStudents,
    activeStudents30d,
    averageProgressPercent,
    averageTestPercent: averageTestPercentVal,
    practicesCompleted,
    certificatesIssued: stats.certificatesIssuedTotal,
    pendingSubmissions: stats.pendingWorkCount,
    studentsCompletedCourse: stats.studentsCompletedCourse,
  };

  const wrongTop = [...wrongAnswerGroups].sort((a, b) => b._count._all - a._count._all).slice(0, 5);
  const questionIds = wrongTop.map((w) => w.questionId);
  const [questions, gradedGroups] = await Promise.all([
    questionIds.length
      ? prisma.question.findMany({
          where: { id: { in: questionIds } },
          select: {
            id: true,
            questionText: true,
            test: { select: { module: { select: { id: true, title: true } } } },
          },
        })
      : Promise.resolve([]),
    questionIds.length
      ? prisma.testAttemptAnswer.groupBy({
          by: ["questionId"],
          where: { questionId: { in: questionIds }, isCorrect: { not: null } },
          _count: { _all: true },
        })
      : Promise.resolve([]),
  ]);
  const qMap = new Map(questions.map((q) => [q.id, q]));
  const gradedMap = new Map(gradedGroups.map((g) => [g.questionId, g._count._all]));

  const difficultQuestions: AdminDifficultQuestion[] = wrongTop
    .map((w) => {
      const q = qMap.get(w.questionId);
      if (!q) return null;
      return {
        questionId: w.questionId,
        questionText: q.questionText.slice(0, 120),
        moduleId: q.test.module.id,
        moduleTitle: q.test.module.title,
        wrongCount: w._count._all,
        gradedCount: gradedMap.get(w.questionId) ?? 0,
      };
    })
    .filter((x): x is AdminDifficultQuestion => x != null);

  const completedMap = new Map(moduleCompletedGroups.map((g) => [g.moduleId, g._count._all]));
  const difficultModules: AdminLowCompletionModule[] = activeModules
    .map((m) => {
      const completedCount = completedMap.get(m.id) ?? 0;
      const rate = studentCount > 0 ? Math.round((completedCount / studentCount) * 100) : 0;
      return {
        moduleId: m.id,
        title: m.title,
        orderNumber: m.orderNumber,
        completionRatePercent: rate,
        completedCount,
        studentCount,
      };
    })
    .filter((m) => studentCount > 0 && m.completionRatePercent < 70)
    .sort((a, b) => a.completionRatePercent - b.completionRatePercent)
    .slice(0, 6);

  const totalByTask = new Map(submissionTotals.map((r) => [r.practicalTaskId, r._count._all]));
  const stuckTaskIds = rejectGroups.map((r) => r.practicalTaskId);
  const tasks =
    stuckTaskIds.length > 0
      ? await prisma.practicalTask.findMany({
          where: { id: { in: stuckTaskIds } },
          select: { id: true, title: true, module: { select: { title: true } } },
        })
      : [];
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  const difficultPractices: AdminStuckPractice[] = rejectGroups
    .map((r) => {
      const t = taskMap.get(r.practicalTaskId);
      const total = totalByTask.get(r.practicalTaskId) ?? 0;
      if (!t || total === 0) return null;
      return {
        taskId: r.practicalTaskId,
        title: t.title,
        moduleTitle: t.module.title,
        stuckCount: r._count._all,
        totalSubmissions: total,
        stuckRatePercent: Math.round((r._count._all / total) * 100),
      };
    })
    .filter((x): x is AdminStuckPractice => x != null)
    .sort((a, b) => b.stuckRatePercent - a.stuckRatePercent)
    .slice(0, 5);

  function studentLabel(
    email: string,
    profile: { firstName: string; lastName: string; middleName: string | null } | null,
  ): string {
    if (!profile) return email;
    const mid = profile.middleName ? ` ${profile.middleName}` : "";
    return `${profile.lastName} ${profile.firstName}${mid}`.trim();
  }

  const submissionQueue: AdminSubmissionQueueItem[] = pendingSubmissionRows.map((s) => ({
    id: s.id,
    studentLabel: studentLabel(s.user.email, s.user.profile),
    email: s.user.email,
    moduleTitle: s.practicalTask.module.title,
    taskTitle: s.practicalTask.title,
    status: s.status,
    statusLabel: STATUS_RU[s.status] ?? s.status,
    at: s.updatedAt.toISOString(),
    href: `/admin/submissions/${s.id}`,
  }));

  const eligibleWithoutCert = Math.max(0, stats.studentsCompletedCourse - stats.certificatesIssuedTotal);

  const certificates: AdminCertificateSnapshot = {
    issuedTotal: stats.certificatesIssuedTotal,
    eligibleWithoutCert,
    recent: recentCerts.map((c) => ({
      id: c.id,
      certificateNumber: c.certificateNumber,
      courseTitle: c.course.title,
      issuedAt: c.issuedAt.toISOString(),
      verifyHref: certificateVerifyUrl(c.certificateNumber),
      hasPdf: Boolean(c.pdfUrl),
    })),
  };

  const auditEvents: AdminAuditEvent[] = auditRows.map((row) => ({
    id: row.id,
    action: row.action,
    actionLabel: auditActionLabelRu(row.action),
    severity: row.severity,
    at: row.createdAt.toISOString(),
    actorLabel: auditActorLabel(Boolean(row.actorId)),
    path: row.path,
    sensitive: isSensitiveAuditAction(row.action),
    suspicious: isSuspiciousAuditEvent(row.action, row.severity),
  }));

  const suspiciousEvents = auditEvents.filter((e) => e.suspicious).slice(0, 8);
  const importantEvents = buildImportantEvents(extended.recent, suspiciousEvents);

  return {
    stats,
    extended,
    overview,
    importantEvents,
    suspiciousEvents,
    difficult: {
      questions: difficultQuestions,
      modules: difficultModules,
      practices: difficultPractices,
    },
    submissionQueue,
    certificates,
    auditEvents,
  };
}
