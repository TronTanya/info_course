import { prisma } from "@/lib/db";
import { parseProfileEducationalInstitution } from "@/lib/profile-school-parse";
import { isDbConnectionError, withDbRetry } from "@/lib/prisma-retry";

export type AdminUserListRow = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  fullName: string;
  /** Название заведения без суффиксов «группа …» / «N курс». */
  educationalInstitution: string;
  /** Академическая группа (например КИ-25) или «—». */
  studyGroup: string;
  /** Номер курса (1–6) или «—». */
  studyCourseYear: string;
  /** Специальность из профиля (например «Программист»). */
  specialty: string;
  createdAt: string;
  overallProgressPercent: number;
  totalScore: number;
  hasCertificate: boolean;
  /** Число строк в `course_progress`, привязанных к userId. */
  courseProgressRowCount: number;
  testAttemptCount: number;
  testsPassedCount: number;
  practicesCompletedCount: number;
  /** Последняя активность (тест, практика, прогресс) — proxy, не login session. */
  lastActivityAt: string | null;
};

function formatFio(p: {
  lastName: string;
  firstName: string;
  middleName: string | null;
}): string {
  return [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ").trim();
}

/** Учётки автотестов Playwright — не показываем в админке студентов. */
function isE2eTestAccount(email: string): boolean {
  return /^e2e-/i.test(email);
}

export type AdminUserListResult = {
  rows: AdminUserListRow[];
  dbUnavailable: boolean;
};

export async function getAdminUserListRows(): Promise<AdminUserListRow[]> {
  const { rows } = await getAdminUserListRowsWithStatus();
  return rows;
}

export async function getAdminUserListRowsWithStatus(): Promise<AdminUserListResult> {
  try {
    const rows = await withDbRetry(loadAdminUserListRows);
    return { rows, dbUnavailable: false };
  } catch (error) {
    if (!isDbConnectionError(error)) throw error;
    console.warn("[getAdminUserListRows] БД недоступна:", error);
    return { rows: [], dbUnavailable: true };
  }
}

async function loadAdminUserListRows(): Promise<AdminUserListRow[]> {
  let course: { id: string } | null = null;
  try {
    course = await prisma.course.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
  } catch {
    /* прогресс по курсу будет 0 */
  }

  const users = await prisma.user.findMany({
    where: { NOT: { email: { startsWith: "e2e-", mode: "insensitive" } } },
    orderBy: [{ profile: { lastName: "asc" } }, { profile: { firstName: "asc" } }, { createdAt: "asc" }],
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      profile: {
        select: {
          lastName: true,
          firstName: true,
          middleName: true,
          educationalInstitution: true,
          specialty: true,
        },
      },
      certificates: { select: { id: true }, take: 1 },
      _count: { select: { courseProgressRows: true } },
    },
  });

  const studentIds = users.filter((u) => u.role === "USER").map((u) => u.id);
  const activeModuleIds =
    course && studentIds.length > 0
      ? (
          await prisma.module.findMany({
            where: { courseId: course.id, isActive: true },
            select: { id: true },
          })
        ).map((m) => m.id)
      : [];

  const [testAttemptsByUser, testsPassedByUser, practiceDoneByUser, lastTest, lastSub, lastProgress, courseProgress] =
    studentIds.length > 0
      ? await Promise.all([
          prisma.testAttempt.groupBy({
            by: ["userId"],
            where: { userId: { in: studentIds } },
            _count: { _all: true },
          }),
          prisma.testAttempt.groupBy({
            by: ["userId"],
            where: { userId: { in: studentIds }, passed: true },
            _count: { _all: true },
          }),
          prisma.progress.groupBy({
            by: ["userId"],
            where: { userId: { in: studentIds }, practiceCompleted: true },
            _count: { _all: true },
          }),
          prisma.testAttempt.groupBy({
            by: ["userId"],
            where: { userId: { in: studentIds } },
            _max: { createdAt: true },
          }),
          prisma.submission.groupBy({
            by: ["userId"],
            where: { userId: { in: studentIds }, status: { not: "DRAFT" } },
            _max: { updatedAt: true },
          }),
          prisma.progress.groupBy({
            by: ["userId"],
            where: { userId: { in: studentIds } },
            _max: { updatedAt: true },
          }),
          activeModuleIds.length > 0
            ? prisma.progress.findMany({
                where: { userId: { in: studentIds }, moduleId: { in: activeModuleIds } },
                select: { userId: true, moduleCompleted: true, score: true },
              })
            : Promise.resolve([]),
        ])
      : [[], [], [], [], [], [], []];

  const testCountMap = new Map(testAttemptsByUser.map((r) => [r.userId, r._count._all]));
  const passedMap = new Map(testsPassedByUser.map((r) => [r.userId, r._count._all]));
  const practiceMap = new Map(practiceDoneByUser.map((r) => [r.userId, r._count._all]));
  const lastTestMap = new Map(lastTest.map((r) => [r.userId, r._max.createdAt ?? null]));
  const lastSubMap = new Map(lastSub.map((r) => [r.userId, r._max.updatedAt ?? null]));
  const lastProgressMap = new Map(lastProgress.map((r) => [r.userId, r._max.updatedAt ?? null]));

  const progressAgg = new Map<string, { completedModules: number; totalScore: number }>();
  for (const row of courseProgress) {
    const prev = progressAgg.get(row.userId) ?? { completedModules: 0, totalScore: 0 };
    progressAgg.set(row.userId, {
      completedModules: prev.completedModules + (row.moduleCompleted ? 1 : 0),
      totalScore: prev.totalScore + row.score,
    });
  }

  function lastActivityFor(userId: string): string | null {
    const dates: Date[] = [];
    const t = lastTestMap.get(userId);
    const s = lastSubMap.get(userId);
    const p = lastProgressMap.get(userId);
    if (t) dates.push(t);
    if (s) dates.push(s);
    if (p) dates.push(p);
    if (dates.length === 0) return null;
    return new Date(Math.max(...dates.map((d) => d.getTime()))).toISOString();
  }

  const rows: AdminUserListRow[] = users
    .filter((u) => !isE2eTestAccount(u.email))
    .map((u) => {
      let overallProgressPercent = 0;
      let totalScore = 0;

      if (course && u.role === "USER" && activeModuleIds.length > 0) {
        const agg = progressAgg.get(u.id);
        const completedModules = agg?.completedModules ?? 0;
        overallProgressPercent = Math.round((completedModules / activeModuleIds.length) * 100);
        totalScore = agg?.totalScore ?? 0;
      }

      const p = u.profile;
      const fromProfile = p ? formatFio(p) : "";
      const rawSchool = (p?.educationalInstitution?.trim() || "").replace(/^—$/, "");
      const school = parseProfileEducationalInstitution(rawSchool);
      return {
        id: u.id,
        email: u.email,
        role: u.role,
        fullName: fromProfile || u.email || "—",
        educationalInstitution: school.institution,
        studyGroup: school.group,
        studyCourseYear: school.courseYear,
        specialty: p?.specialty?.trim() || "—",
        createdAt: u.createdAt.toISOString(),
        overallProgressPercent,
        totalScore,
        hasCertificate: u.certificates.length > 0,
        courseProgressRowCount: u._count.courseProgressRows,
        testAttemptCount: u.role === "USER" ? (testCountMap.get(u.id) ?? 0) : 0,
        testsPassedCount: u.role === "USER" ? (passedMap.get(u.id) ?? 0) : 0,
        practicesCompletedCount: u.role === "USER" ? (practiceMap.get(u.id) ?? 0) : 0,
        lastActivityAt: u.role === "USER" ? lastActivityFor(u.id) : null,
      };
    });

  return rows;
}
