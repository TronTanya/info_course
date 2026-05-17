import { prisma } from "@/lib/db";

export type AdminDashboardStats = {
  totalUsers: number;
  activeStudents: number;
  /** Студенты (USER), завершившие все активные модули основного курса (без обязательного сертификата). */
  studentsCompletedCourse: number;
  /** Отправки практики, ожидающие действия проверяющего. */
  pendingWorkCount: number;
  /** Записей в реестре сертификатов (выданных документов). */
  certificatesIssuedTotal: number;
  /** Отзывы с isPublished = true. */
  publishedReviewsCount: number;
};

export type AdminContentOverview = {
  courseTitle: string | null;
  modulesTotal: number;
  modulesActive: number;
  lessonsTotal: number;
  testsTotal: number;
  practicalTasksTotal: number;
};

export type AdminRecentActivityItem = {
  id: string;
  kind: "submission" | "user";
  title: string;
  subtitle: string;
  at: string;
  href: string;
};

export type AdminDashboardExtended = {
  content: AdminContentOverview;
  recent: AdminRecentActivityItem[];
  systemOk: boolean;
};

/**
 * Число студентов USER, у которых по всем активным модулям курса progress.moduleCompleted = true.
 */
async function countStudentsCompletedAllModules(courseId: string): Promise<number> {
  const modules = await prisma.module.findMany({
    where: { courseId, isActive: true },
    select: { id: true },
  });
  const moduleIds = modules.map((m) => m.id);
  if (moduleIds.length === 0) return 0;

  const done = await prisma.progress.findMany({
    where: {
      moduleId: { in: moduleIds },
      moduleCompleted: true,
      user: { role: "USER" },
    },
    select: { userId: true, moduleId: true },
  });

  const byUser = new Map<string, Set<string>>();
  for (const row of done) {
    if (!byUser.has(row.userId)) byUser.set(row.userId, new Set());
    byUser.get(row.userId)!.add(row.moduleId);
  }

  const needCount = moduleIds.length;
  let n = 0;
  for (const [, set] of byUser) {
    if (set.size === needCount) n++;
  }
  return n;
}

/**
 * Метрики для главной админки. Не загружает passwordHash и прочие секреты.
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  const courseId = course?.id ?? null;

  const [
    totalUsers,
    activeStudents,
    studentsCompletedCourse,
    pendingWorkCount,
    certificatesIssuedTotal,
    publishedReviewsCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        role: "USER",
        OR: [
          {
            progress: {
              some: {
                OR: [
                  { lessonCompleted: true },
                  { videoCompleted: true },
                  { testCompleted: true },
                  { practiceCompleted: true },
                  { moduleCompleted: true },
                  { score: { gt: 0 } },
                ],
              },
            },
          },
          { submissions: { some: { status: { not: "DRAFT" } } } },
          { testAttempts: { some: {} } },
        ],
      },
    }),
    courseId ? countStudentsCompletedAllModules(courseId) : Promise.resolve(0),
    prisma.submission.count({
      where: { status: { in: ["SUBMITTED", "CHECKING", "NEEDS_REVISION"] } },
    }),
    prisma.certificate.count(),
    prisma.review.count({ where: { isPublished: true } }),
  ]);

  return {
    totalUsers,
    activeStudents,
    studentsCompletedCourse,
    pendingWorkCount,
    certificatesIssuedTotal,
    publishedReviewsCount,
  };
}

export async function getAdminDashboardExtended(): Promise<AdminDashboardExtended> {
  const course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true },
  });

  if (!course) {
    return {
      content: {
        courseTitle: null,
        modulesTotal: 0,
        modulesActive: 0,
        lessonsTotal: 0,
        testsTotal: 0,
        practicalTasksTotal: 0,
      },
      recent: [],
      systemOk: false,
    };
  }

  const [
    modulesTotal,
    modulesActive,
    lessonsTotal,
    testsTotal,
    practicalTasksTotal,
    recentSubmissions,
    recentUsers,
  ] = await Promise.all([
    prisma.module.count({ where: { courseId: course.id } }),
    prisma.module.count({ where: { courseId: course.id, isActive: true } }),
    prisma.lesson.count({ where: { module: { courseId: course.id } } }),
    prisma.test.count({ where: { module: { courseId: course.id } } }),
    prisma.practicalTask.count({ where: { module: { courseId: course.id } } }),
    prisma.submission.findMany({
      where: { status: { not: "DRAFT" } },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        status: true,
        updatedAt: true,
        user: { select: { email: true } },
        practicalTask: { select: { title: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, email: true, role: true, createdAt: true },
    }),
  ]);

  const submissionItems: AdminRecentActivityItem[] = recentSubmissions.map((s) => ({
    id: `sub-${s.id}`,
    kind: "submission",
    title: s.practicalTask.title,
    subtitle: `${s.user.email} · ${s.status}`,
    at: s.updatedAt.toISOString(),
    href: `/admin/submissions/${s.id}`,
  }));

  const userItems: AdminRecentActivityItem[] = recentUsers.map((u) => ({
    id: `user-${u.id}`,
    kind: "user",
    title: u.email,
    subtitle: u.role === "ADMIN" ? "Новый администратор" : "Новый студент",
    at: u.createdAt.toISOString(),
    href: `/admin/users/${u.id}`,
  }));

  const recent = [...submissionItems, ...userItems]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  return {
    content: {
      courseTitle: course.title,
      modulesTotal,
      modulesActive,
      lessonsTotal,
      testsTotal,
      practicalTasksTotal,
    },
    recent,
    systemOk: true,
  };
}
