import { prisma } from "@/lib/db";
import { getAdminDashboardExtended, getAdminDashboardStats } from "@/lib/admin-dashboard";
import { readinessStatus, runReadinessChecks } from "@/lib/health/readiness";

export type AdminSecurityOverview = {
  totalUsers: number;
  activeStudents: number;
  studentsCompletedCourse: number;
  averageProgressPercent: number;
  practiceSubmissionsTotal: number;
  testAttemptsTotal: number;
  testPassRatePercent: number | null;
  pendingWorkCount: number;
};

export type AdminContentQuickLink = {
  label: string;
  count: number;
  href: string;
  description: string;
};

export type AdminModulePopularity = {
  moduleId: string;
  title: string;
  orderNumber: number;
  activityCount: number;
};

export type AdminHardTest = {
  testId: string;
  title: string;
  moduleTitle: string;
  attempts: number;
  passRatePercent: number;
};

export type AdminFailureTask = {
  taskId: string;
  title: string;
  moduleTitle: string;
  rejectCount: number;
  totalCount: number;
  failureRatePercent: number;
};

export type AdminDayActivity = {
  date: string;
  label: string;
  count: number;
};

export type AdminSystemIssue = {
  id: string;
  title: string;
  subtitle: string;
  at: string;
  severity: "warning" | "danger" | "info";
  href?: string;
};

export type AdminSecurityDashboardData = {
  overview: AdminSecurityOverview;
  content: AdminContentQuickLink[];
  popularModules: AdminModulePopularity[];
  hardTests: AdminHardTest[];
  failureTasks: AdminFailureTask[];
  activityByDay: AdminDayActivity[];
  system: {
    appStatus: "ok" | "degraded";
    database: "ok" | "error";
    redis: "ok" | "error" | "skipped";
    warnings: string[];
    issues: AdminSystemIssue[];
  };
};

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

  const sumPct = completedByUser.reduce((acc, row) => {
    const pct = Math.round((row._count._all / activeModuleCount) * 100);
    return acc + pct;
  }, 0);

  const usersWithProgress = completedByUser.length;
  const usersWithout = studentCount - usersWithProgress;
  return Math.round((sumPct + usersWithout * 0) / studentCount);
}

function lastNDays(n: number): { date: string; label: string; start: Date; end: Date }[] {
  const days: { date: string; label: string; start: Date; end: Date }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const end = new Date(d);
    end.setDate(end.getDate() + 1);
    const iso = d.toISOString().slice(0, 10);
    days.push({
      date: iso,
      label: d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
      start: d,
      end,
    });
  }
  return days;
}

export async function getAdminSecurityDashboardData(): Promise<AdminSecurityDashboardData> {
  const [baseStats, extended, checks, activeModuleCount] = await Promise.all([
    getAdminDashboardStats(),
    getAdminDashboardExtended(),
    runReadinessChecks(),
    prisma.module.count({ where: { isActive: true } }),
  ]);

  const since14 = new Date();
  since14.setDate(since14.getDate() - 13);
  since14.setHours(0, 0, 0, 0);

  const [
    averageProgressPercent,
    practiceSubmissionsTotal,
    testAttemptsTotal,
    testPassedCount,
    moduleProgressGroups,
    testAttempts,
    rejectGroups,
    submissionTotals,
    recentSubs,
    recentAttempts,
    recentProgressErrors,
    daySubs,
    dayAttempts,
    dayUsers,
  ] = await Promise.all([
    averageStudentProgressPercent(),
    prisma.submission.count({ where: { status: { not: "DRAFT" } } }),
    prisma.testAttempt.count(),
    prisma.testAttempt.count({ where: { passed: true } }),
    prisma.progress.groupBy({
      by: ["moduleId"],
      where: {
        module: { isActive: true },
        OR: [
          { lessonCompleted: true },
          { testCompleted: true },
          { practiceCompleted: true },
          { moduleCompleted: true },
        ],
      },
      _count: { _all: true },
    }),
    prisma.testAttempt.findMany({
      select: { testId: true, passed: true, test: { select: { title: true, module: { select: { title: true } } } } },
      take: 5000,
      orderBy: { createdAt: "desc" },
    }),
    prisma.submission.groupBy({
      by: ["practicalTaskId"],
      where: { status: "REJECTED" },
      _count: { _all: true },
    }),
    prisma.submission.groupBy({
      by: ["practicalTaskId"],
      where: { status: { not: "DRAFT" } },
      _count: { _all: true },
    }),
    prisma.submission.findMany({
      where: { status: { in: ["REJECTED", "NEEDS_REVISION"] } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        updatedAt: true,
        practicalTask: { select: { title: true } },
        user: { select: { email: true } },
      },
    }),
    prisma.testAttempt.findMany({
      where: { passed: false },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        createdAt: true,
        test: { select: { title: true } },
        user: { select: { email: true } },
      },
    }),
    prisma.courseProgress.findMany({
      where: { errors: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 3,
      select: { id: true, errors: true, fullName: true, completedAt: true },
    }),
    prisma.submission.findMany({
      where: { createdAt: { gte: since14 }, status: { not: "DRAFT" } },
      select: { createdAt: true },
    }),
    prisma.testAttempt.findMany({
      where: { createdAt: { gte: since14 } },
      select: { createdAt: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: since14 } },
      select: { createdAt: true },
    }),
  ]);

  const testPassRatePercent =
    testAttemptsTotal > 0 ? Math.round((testPassedCount / testAttemptsTotal) * 100) : null;

  const moduleIds = moduleProgressGroups.map((g) => g.moduleId);
  const modules =
    moduleIds.length > 0
      ? await prisma.module.findMany({
          where: { id: { in: moduleIds } },
          select: { id: true, title: true, orderNumber: true },
        })
      : [];
  const moduleMap = new Map(modules.map((m) => [m.id, m]));

  const popularModules: AdminModulePopularity[] = moduleProgressGroups
    .map((g) => {
      const m = moduleMap.get(g.moduleId);
      if (!m) return null;
      return {
        moduleId: g.moduleId,
        title: m.title,
        orderNumber: m.orderNumber,
        activityCount: g._count._all,
      };
    })
    .filter((x): x is AdminModulePopularity => x != null)
    .sort((a, b) => b.activityCount - a.activityCount)
    .slice(0, 6);

  const testAgg = new Map<string, { attempts: number; passed: number; title: string; moduleTitle: string }>();
  for (const a of testAttempts) {
    const cur = testAgg.get(a.testId) ?? {
      attempts: 0,
      passed: 0,
      title: a.test.title,
      moduleTitle: a.test.module.title,
    };
    cur.attempts += 1;
    if (a.passed) cur.passed += 1;
    testAgg.set(a.testId, cur);
  }

  const hardTests: AdminHardTest[] = [...testAgg.entries()]
    .filter(([, v]) => v.attempts >= 3)
    .map(([testId, v]) => ({
      testId,
      title: v.title,
      moduleTitle: v.moduleTitle,
      attempts: v.attempts,
      passRatePercent: Math.round((v.passed / v.attempts) * 100),
    }))
    .sort((a, b) => a.passRatePercent - b.passRatePercent)
    .slice(0, 5);

  const totalByTask = new Map(submissionTotals.map((r) => [r.practicalTaskId, r._count._all]));
  const rejectTaskIds = rejectGroups.map((r) => r.practicalTaskId);
  const tasks =
    rejectTaskIds.length > 0
      ? await prisma.practicalTask.findMany({
          where: { id: { in: rejectTaskIds } },
          select: { id: true, title: true, module: { select: { title: true } } },
        })
      : [];
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  const failureTasks: AdminFailureTask[] = rejectGroups
    .map((r) => {
      const t = taskMap.get(r.practicalTaskId);
      const total = totalByTask.get(r.practicalTaskId) ?? 0;
      if (!t || total === 0) return null;
      return {
        taskId: r.practicalTaskId,
        title: t.title,
        moduleTitle: t.module.title,
        rejectCount: r._count._all,
        totalCount: total,
        failureRatePercent: Math.round((r._count._all / total) * 100),
      };
    })
    .filter((x): x is AdminFailureTask => x != null)
    .sort((a, b) => b.failureRatePercent - a.failureRatePercent)
    .slice(0, 5);

  const days = lastNDays(14);
  const activityByDay: AdminDayActivity[] = days.map((d) => {
    const inDay = (dt: Date) => dt >= d.start && dt < d.end;
    const count =
      daySubs.filter((s) => inDay(s.createdAt)).length +
      dayAttempts.filter((a) => inDay(a.createdAt)).length +
      dayUsers.filter((u) => inDay(u.createdAt)).length;
    return { date: d.date, label: d.label, count };
  });

  const warnings: string[] = [];
  if (checks.database !== "ok") warnings.push("Нет связи с базой данных");
  if (checks.redis === "error") warnings.push("Redis недоступен (rate limit / кэш)");
  if (baseStats.pendingWorkCount > 0) warnings.push(`${baseStats.pendingWorkCount} работ на проверке`);
  if (!extended.systemOk) warnings.push("Курс не настроен в БД");
  if (activeModuleCount === 0) warnings.push("Нет активных модулей");

  const issues: AdminSystemIssue[] = [
    ...recentSubs.map((s) => ({
      id: `sub-${s.id}`,
      title: s.practicalTask.title,
      subtitle: `${s.user.email} · ${s.status}`,
      at: s.updatedAt.toISOString(),
      severity: s.status === "REJECTED" ? ("danger" as const) : ("warning" as const),
      href: `/admin/submissions/${s.id}`,
    })),
    ...recentAttempts.map((a) => ({
      id: `ta-${a.id}`,
      title: `Тест не пройден: ${a.test.title}`,
      subtitle: a.user.email,
      at: a.createdAt.toISOString(),
      severity: "warning" as const,
    })),
    ...recentProgressErrors
      .filter((r) => r.errors?.trim())
      .map((r) => ({
        id: `cpe-${r.id}`,
        title: `Ошибка отчёта: ${r.fullName}`,
        subtitle: r.errors!.slice(0, 120),
        at: r.completedAt.toISOString(),
        severity: "danger" as const,
      })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  const content: AdminContentQuickLink[] = [
    {
      label: "Модули",
      count: extended.content.modulesTotal,
      href: "/admin/modules",
      description: `${extended.content.modulesActive} активных`,
    },
    {
      label: "Лекции",
      count: extended.content.lessonsTotal,
      href: "/admin/lessons",
      description: "Редактор материалов",
    },
    {
      label: "Тесты",
      count: extended.content.testsTotal,
      href: "/admin/tests",
      description: "Контрольные",
    },
    {
      label: "Практика",
      count: extended.content.practicalTasksTotal,
      href: "/admin/practical-tasks",
      description: "Лаборатории",
    },
  ];

  return {
    overview: {
      totalUsers: baseStats.totalUsers,
      activeStudents: baseStats.activeStudents,
      studentsCompletedCourse: baseStats.studentsCompletedCourse,
      averageProgressPercent,
      practiceSubmissionsTotal,
      testAttemptsTotal,
      testPassRatePercent,
      pendingWorkCount: baseStats.pendingWorkCount,
    },
    content,
    popularModules,
    hardTests,
    failureTasks,
    activityByDay,
    system: {
      appStatus: readinessStatus(checks),
      database: checks.database,
      redis: checks.redis,
      warnings,
      issues,
    },
  };
}
