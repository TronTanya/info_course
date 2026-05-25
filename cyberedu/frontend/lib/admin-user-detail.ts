import { assertAdminDataAccess } from "@/lib/admin-access";
import {
  buildAdminStudentRecentActivity,
  type AdminStudentActivityItem,
} from "@/lib/admin-student-detail-logic";
import { canGenerateCertificate, certificateVerifyUrl } from "@/lib/certificate";
import { prisma } from "@/lib/db";
import { getUserCourseProgress } from "@/lib/progress";

function formatFio(p: {
  lastName: string;
  firstName: string;
  middleName: string | null;
}): string {
  return [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ");
}

export async function getAdminUserDetail(userId: string) {
  await assertAdminDataAccess();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      emailVerified: true,
      profile: {
        select: {
          lastName: true,
          firstName: true,
          middleName: true,
          avatarUrl: true,
          birthDate: true,
          educationalInstitution: true,
          city: true,
          specialty: true,
          interests: true,
        },
      },
      certificates: {
        orderBy: { issuedAt: "desc" },
        select: {
          id: true,
          certificateNumber: true,
          issuedAt: true,
          verificationCode: true,
          pdfUrl: true,
          course: { select: { title: true, id: true } },
        },
      },
    },
  });

  if (!user) return null;

  const course = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true },
  });

  const courseProgress =
    course && user.role === "USER" ? await getUserCourseProgress(user.id, course.id) : null;

  const testAttempts = await prisma.testAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      score: true,
      maxScore: true,
      passed: true,
      createdAt: true,
      test: {
        select: {
          id: true,
          title: true,
          module: { select: { id: true, title: true } },
        },
      },
    },
  });

  const submissions = await prisma.submission.findMany({
    where: { userId, status: { not: "DRAFT" } },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      status: true,
      score: true,
      fileUrl: true,
      createdAt: true,
      updatedAt: true,
      practicalTask: {
        select: {
          id: true,
          title: true,
          module: { select: { id: true, title: true } },
        },
      },
    },
  });

  const certificates = user.certificates.map((c) => ({
    id: c.id,
    certificateNumber: c.certificateNumber,
    issuedAt: c.issuedAt.toISOString(),
    verificationCode: c.verificationCode,
    pdfUrl: c.pdfUrl,
    courseTitle: c.course.title,
    courseId: c.course.id,
    verifyHref: certificateVerifyUrl(c.certificateNumber),
  }));

  const mappedAttempts = testAttempts.map((a) => ({
    id: a.id,
    testId: a.test.id,
    testTitle: a.test.title,
    moduleId: a.test.module.id,
    moduleTitle: a.test.module.title,
    score: a.score,
    maxScore: a.maxScore,
    passed: a.passed,
    createdAt: a.createdAt.toISOString(),
  }));

  const mappedSubmissions = submissions.map((s) => ({
    id: s.id,
    taskId: s.practicalTask.id,
    taskTitle: s.practicalTask.title,
    moduleId: s.practicalTask.module.id,
    moduleTitle: s.practicalTask.module.title,
    status: s.status,
    score: s.score,
    hasText: false,
    hasFile: Boolean(s.fileUrl?.trim()),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    reviewHref: `/admin/submissions/${s.id}`,
  }));

  const recentActivity: AdminStudentActivityItem[] = buildAdminStudentRecentActivity({
    testAttempts: mappedAttempts,
    submissions: mappedSubmissions.map((s) => ({
      id: s.id,
      taskTitle: s.taskTitle,
      moduleTitle: s.moduleTitle,
      status: s.status,
      createdAt: s.updatedAt,
      reviewHref: s.reviewHref,
    })),
    certificates: certificates.map((c) => ({
      id: c.id,
      courseTitle: c.courseTitle,
      issuedAt: c.issuedAt,
      verifyHref: c.verifyHref,
    })),
  });

  const eligibleForCertificate =
    user.role === "USER" && course != null && certificates.length === 0
      ? await canGenerateCertificate(user.id, course.id)
      : false;

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      emailVerified: user.emailVerified?.toISOString() ?? null,
    },
    profile: user.profile
      ? {
          fullName: formatFio(user.profile),
          avatarUrl: user.profile.avatarUrl,
          educationalInstitution: user.profile.educationalInstitution,
          city: user.profile.city,
          specialty: user.profile.specialty,
          interests: user.profile.interests,
          birthDate: user.profile.birthDate.toISOString().slice(0, 10),
        }
      : null,
    course: course ? { id: course.id, title: course.title } : null,
    courseProgress,
    testAttempts: mappedAttempts,
    submissions: mappedSubmissions,
    certificates,
    recentActivity,
    eligibleForCertificate,
  };
}

export type AdminUserDetail = NonNullable<Awaited<ReturnType<typeof getAdminUserDetail>>>;
