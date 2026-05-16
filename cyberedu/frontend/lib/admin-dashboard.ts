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
