import { assertAdminDataAccess } from "@/lib/admin-access";
import type { AdminExportType } from "@/lib/admin-export-types";
import {
  assertCsvExportSafe,
  certificatesExportToCsv,
  progressExportToCsv,
  studentsExportToCsv,
  submissionsExportToCsv,
  type CertificateExportRow,
  type ProgressExportRow,
  type SubmissionExportRow,
} from "@/lib/admin-csv";
import { getAdminUserListRows } from "@/lib/admin-users-list";
import { prisma } from "@/lib/db";

const SUBMISSION_EXPORT_LIMIT = 3000;
const PROGRESS_EXPORT_LIMIT = 5000;

function boolRu(v: boolean): string {
  return v ? "Да" : "Нет";
}

function formatDateRu(iso: string | Date | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SUBMISSION_STATUS_RU: Record<string, string> = {
  DRAFT: "Черновик",
  SUBMITTED: "Отправлено",
  CHECKING: "На проверке",
  ACCEPTED: "Принято",
  REJECTED: "Отклонено",
  NEEDS_REVISION: "На доработке",
};

async function loadProgressExportRows(): Promise<ProgressExportRow[]> {
  const [platform, external] = await Promise.all([
    prisma.progress.findMany({
      where: { user: { role: "USER" } },
      orderBy: { updatedAt: "desc" },
      take: PROGRESS_EXPORT_LIMIT,
      select: {
        userId: true,
        lessonCompleted: true,
        videoCompleted: true,
        testCompleted: true,
        practiceCompleted: true,
        moduleCompleted: true,
        score: true,
        updatedAt: true,
        module: { select: { title: true } },
      },
    }),
    prisma.courseProgress.findMany({
      orderBy: { completedAt: "desc" },
      take: PROGRESS_EXPORT_LIMIT,
      select: {
        userId: true,
        fullName: true,
        groupName: true,
        college: true,
        course: true,
        year: true,
        completedAt: true,
      },
    }),
  ]);

  const rows: ProgressExportRow[] = platform.map((p) => ({
    source: "platform",
    userId: p.userId,
    moduleOrCourse: p.module.title,
    lesson: boolRu(p.lessonCompleted),
    video: boolRu(p.videoCompleted),
    test: boolRu(p.testCompleted),
    practice: boolRu(p.practiceCompleted),
    moduleDone: boolRu(p.moduleCompleted),
    score: String(p.score),
    at: formatDateRu(p.updatedAt),
    groupName: "",
    college: "",
  }));

  for (const e of external) {
    rows.push({
      source: "course_progress",
      userId: e.userId ?? "",
      moduleOrCourse: `${e.course} (${e.year} курс)`,
      lesson: "",
      video: "",
      test: "",
      practice: "",
      moduleDone: "",
      score: "",
      at: formatDateRu(e.completedAt),
      groupName: e.groupName,
      college: e.college,
    });
  }

  return rows;
}

async function loadSubmissionExportRows(): Promise<SubmissionExportRow[]> {
  const rows = await prisma.submission.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { createdAt: "desc" },
    take: SUBMISSION_EXPORT_LIMIT,
    select: {
      id: true,
      userId: true,
      status: true,
      score: true,
      createdAt: true,
      checkedAt: true,
      practicalTask: {
        select: {
          title: true,
          taskType: true,
          module: { select: { title: true } },
        },
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    moduleTitle: r.practicalTask.module.title,
    taskTitle: r.practicalTask.title,
    taskType: r.practicalTask.taskType,
    status: SUBMISSION_STATUS_RU[r.status] ?? r.status,
    score: r.score == null ? "" : String(r.score),
    submittedAt: formatDateRu(r.createdAt),
    checkedAt: formatDateRu(r.checkedAt),
  }));
}

async function loadCertificateExportRows(): Promise<CertificateExportRow[]> {
  const rows = await prisma.certificate.findMany({
    orderBy: { issuedAt: "desc" },
    select: {
      id: true,
      userId: true,
      certificateNumber: true,
      issuedAt: true,
      course: { select: { title: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    certificateNumber: r.certificateNumber,
    courseTitle: r.course.title,
    issuedAt: formatDateRu(r.issuedAt),
  }));
}

export type AdminExportPayload = {
  csv: string;
  rowCount: number;
  exportType: AdminExportType;
};

export async function buildAdminExportPayload(type: AdminExportType): Promise<AdminExportPayload> {
  await assertAdminDataAccess();

  let csv: string;
  let rowCount: number;

  switch (type) {
    case "students": {
      const rows = await getAdminUserListRows();
      rowCount = rows.length;
      csv = studentsExportToCsv(rows);
      break;
    }
    case "progress": {
      const rows = await loadProgressExportRows();
      rowCount = rows.length;
      csv = progressExportToCsv(rows);
      break;
    }
    case "submissions": {
      const rows = await loadSubmissionExportRows();
      rowCount = rows.length;
      csv = submissionsExportToCsv(rows);
      break;
    }
    case "certificates": {
      const rows = await loadCertificateExportRows();
      rowCount = rows.length;
      csv = certificatesExportToCsv(rows);
      break;
    }
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unknown export type: ${_exhaustive}`);
    }
  }

  assertCsvExportSafe(csv, type);
  return { csv, rowCount, exportType: type };
}
