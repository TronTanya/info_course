import { prisma } from "@/lib/db";
import { parseProfileEducationalInstitution } from "@/lib/profile-school-parse";
import { getUserCourseProgress } from "@/lib/progress";

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
};

function formatFio(p: {
  lastName: string;
  firstName: string;
  middleName: string | null;
}): string {
  return [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ").trim();
}

export async function getAdminUserListRows(): Promise<AdminUserListRow[]> {
  const course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
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

  const rows: AdminUserListRow[] = await Promise.all(
    users.map(async (u) => {
      let overallProgressPercent = 0;
      let totalScore = 0;

      if (course && u.role === "USER") {
        const agg = await getUserCourseProgress(u.id, course.id);
        if (agg) {
          overallProgressPercent = agg.overallProgressPercent;
          totalScore = agg.totalScore;
        }
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
      };
    }),
  );

  return rows;
}
