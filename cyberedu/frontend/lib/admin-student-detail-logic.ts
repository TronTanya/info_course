import type { SubmissionStatus } from "@prisma/client";

export const ADMIN_STUDENT_SECTION = {
  modules: "student-modules",
  tests: "student-tests",
  practices: "student-practices",
  certificates: "student-certificates",
  activity: "student-activity",
} as const;

export type AdminStudentActivityKind = "test" | "practice" | "certificate";

export type AdminStudentActivityItem = {
  id: string;
  kind: AdminStudentActivityKind;
  title: string;
  subtitle: string;
  at: string;
  href: string | null;
};

export type BuildRecentActivityInput = {
  testAttempts: Array<{
    id: string;
    testTitle: string;
    moduleTitle: string;
    score: number;
    maxScore: number;
    passed: boolean;
    createdAt: string;
  }>;
  submissions: Array<{
    id: string;
    taskTitle: string;
    moduleTitle: string;
    status: SubmissionStatus;
    createdAt: string;
    reviewHref: string;
  }>;
  certificates: Array<{
    id: string;
    courseTitle: string;
    issuedAt: string;
    verifyHref: string;
  }>;
};

const SUBMISSION_STATUS_RU: Record<SubmissionStatus, string> = {
  DRAFT: "Черновик",
  SUBMITTED: "Отправлено",
  CHECKING: "На проверке",
  ACCEPTED: "Принято",
  REJECTED: "Отклонено",
  NEEDS_REVISION: "На доработку",
};

export function submissionStatusLabelRu(status: SubmissionStatus): string {
  return SUBMISSION_STATUS_RU[status] ?? status;
}

/** Агрегат событий без текстов ответов и ключей тестов. */
export function buildAdminStudentRecentActivity(
  input: BuildRecentActivityInput,
  limit = 12,
): AdminStudentActivityItem[] {
  const items: AdminStudentActivityItem[] = [];

  for (const t of input.testAttempts) {
    if (t.maxScore <= 0) continue;
    items.push({
      id: `test-${t.id}`,
      kind: "test",
      title: t.testTitle,
      subtitle: `${t.moduleTitle} · ${t.passed ? "Зачёт" : "Не зачёт"} · ${t.score}/${t.maxScore}`,
      at: t.createdAt,
      href: null,
    });
  }

  for (const s of input.submissions) {
    if (s.status === "DRAFT") continue;
    items.push({
      id: `sub-${s.id}`,
      kind: "practice",
      title: s.taskTitle,
      subtitle: `${s.moduleTitle} · ${submissionStatusLabelRu(s.status)}`,
      at: s.createdAt,
      href: s.reviewHref,
    });
  }

  for (const c of input.certificates) {
    items.push({
      id: `cert-${c.id}`,
      kind: "certificate",
      title: "Сертификат выдан",
      subtitle: c.courseTitle,
      at: c.issuedAt,
      href: c.verifyHref,
    });
  }

  return items
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}

export function studentSubmissionsQueueHref(userId: string): string {
  return `/admin/submissions?student=${encodeURIComponent(userId)}`;
}
