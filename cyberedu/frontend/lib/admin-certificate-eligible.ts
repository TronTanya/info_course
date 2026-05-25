import { assertAdminDataAccess } from "@/lib/admin-access";
import { prisma } from "@/lib/db";

export type AdminCertificateEligibleRow = {
  userId: string;
  studentLabel: string;
  email: string;
  courseId: string;
  courseTitle: string;
  completedModules: number;
  totalModules: number;
  studentHref: string;
};

function formatStudentLabel(
  email: string,
  profile: { lastName: string; firstName: string; middleName: string | null } | null,
): string {
  if (!profile) return email;
  const mid = profile.middleName ? ` ${profile.middleName}` : "";
  const fio = `${profile.lastName} ${profile.firstName}${mid}`.trim();
  return fio || email;
}

export async function eligibleUserIdsWithoutCertificate(
  courseId: string,
  moduleIds: string[],
): Promise<string[]> {
  if (moduleIds.length === 0) return [];

  const completed = await prisma.progress.groupBy({
    by: ["userId"],
    where: {
      moduleId: { in: moduleIds },
      moduleCompleted: true,
      user: { role: "USER" },
    },
    _count: { _all: true },
  });

  const needCount = moduleIds.length;
  const eligibleIds = completed
    .filter((row) => row._count._all >= needCount)
    .map((row) => row.userId);

  if (eligibleIds.length === 0) return [];

  const withCert = await prisma.certificate.findMany({
    where: { courseId, userId: { in: eligibleIds } },
    select: { userId: true },
  });
  const certSet = new Set(withCert.map((c) => c.userId));
  return eligibleIds.filter((id) => !certSet.has(id));
}

/** Студенты с завершённым курсом без записи в реестре (для админ-очереди выдачи). */
export async function getAdminCertificateEligibleRows(limit = 50): Promise<AdminCertificateEligibleRow[]> {
  await assertAdminDataAccess();

  const course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true },
  });
  if (!course) return [];

  const modules = await prisma.module.findMany({
    where: { courseId: course.id, isActive: true },
    select: { id: true },
  });
  const moduleIds = modules.map((m) => m.id);
  const totalModules = moduleIds.length;
  if (totalModules === 0) return [];

  const userIds = (await eligibleUserIdsWithoutCertificate(course.id, moduleIds)).slice(0, limit);
  if (userIds.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      email: true,
      profile: { select: { lastName: true, firstName: true, middleName: true } },
    },
  });

  return users.map((u) => ({
    userId: u.id,
    studentLabel: formatStudentLabel(u.email, u.profile),
    email: u.email,
    courseId: course.id,
    courseTitle: course.title,
    completedModules: totalModules,
    totalModules,
    studentHref: `/admin/users/${u.id}`,
  }));
}
