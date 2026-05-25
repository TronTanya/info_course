import type { AdminUserListRow } from "@/lib/admin-users-list";
import type { AdminExportType } from "@/lib/admin-export-types";

export function csvCell(value: string | number): string {
  const s = String(value).replace(/\r\n|\r|\n/g, " ");
  if (s.includes('"') || s.includes(";") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(lines: string[][]): string {
  return `\uFEFF${lines.map((row) => row.map((c) => csvCell(c)).join(";")).join("\r\n")}`;
}

/** Студенты: расширенный отчёт (email только в этом типе экспорта). */
export function studentsExportToCsv(rows: AdminUserListRow[]): string {
  const header = [
    "ФИО",
    "Email",
    "Роль",
    "Учебное заведение",
    "Группа",
    "Курс",
    "Специальность",
    "Регистрация",
    "Прогресс %",
    "Баллы",
    "Сертификат",
    "Строк course_progress",
  ];
  const lines = [header];
  for (const r of rows) {
    const reg = new Date(r.createdAt).toLocaleDateString("ru-RU");
    const cert = r.hasCertificate ? "Да" : "Нет";
    const progress = r.role === "USER" ? String(r.overallProgressPercent) : "";
    const score = r.role === "USER" ? String(r.totalScore) : "";
    lines.push([
      r.fullName,
      r.email,
      r.role,
      r.educationalInstitution,
      r.studyGroup,
      r.studyCourseYear,
      r.specialty,
      reg,
      progress,
      score,
      cert,
      String(r.courseProgressRowCount),
    ]);
  }
  return toCsv(lines);
}

export type ProgressExportRow = {
  source: "platform" | "course_progress";
  userId: string;
  moduleOrCourse: string;
  lesson: string;
  video: string;
  test: string;
  practice: string;
  moduleDone: string;
  score: string;
  at: string;
  groupName: string;
  college: string;
};

export function progressExportToCsv(rows: ProgressExportRow[]): string {
  const header = [
    "Источник",
    "ID пользователя",
    "Модуль / курс",
    "Урок",
    "Видео",
    "Тест",
    "Практика",
    "Модуль завершён",
    "Баллы",
    "Дата",
    "Группа",
    "Учебное заведение",
  ];
  const lines = [header, ...rows.map((r) => [
    r.source,
    r.userId,
    r.moduleOrCourse,
    r.lesson,
    r.video,
    r.test,
    r.practice,
    r.moduleDone,
    r.score,
    r.at,
    r.groupName,
    r.college,
  ])];
  return toCsv(lines);
}

export type SubmissionExportRow = {
  id: string;
  userId: string;
  moduleTitle: string;
  taskTitle: string;
  taskType: string;
  status: string;
  score: string;
  submittedAt: string;
  checkedAt: string;
};

export function submissionsExportToCsv(rows: SubmissionExportRow[]): string {
  const header = [
    "ID отправки",
    "ID пользователя",
    "Модуль",
    "Задание",
    "Тип",
    "Статус",
    "Баллы",
    "Отправлено",
    "Проверено",
  ];
  const lines = [header, ...rows.map((r) => [
    r.id,
    r.userId,
    r.moduleTitle,
    r.taskTitle,
    r.taskType,
    r.status,
    r.score,
    r.submittedAt,
    r.checkedAt,
  ])];
  return toCsv(lines);
}

export type CertificateExportRow = {
  id: string;
  userId: string;
  certificateNumber: string;
  courseTitle: string;
  issuedAt: string;
};

export function certificatesExportToCsv(rows: CertificateExportRow[]): string {
  const header = ["ID", "ID пользователя", "Номер сертификата", "Курс", "Выдан"];
  const lines = [header, ...rows.map((r) => [
    r.id,
    r.userId,
    r.certificateNumber,
    r.courseTitle,
    r.issuedAt,
  ])];
  return toCsv(lines);
}

/** @deprecated Используйте `studentsExportToCsv`. */
export function adminUsersToCsv(rows: AdminUserListRow[]): string {
  return studentsExportToCsv(rows);
}

export const ADMIN_EXPORT_FORBIDDEN_CSV_SUBSTRINGS = [
  "password",
  "passwordhash",
  "verificationcode",
  "textanswer",
  "fileurl",
  "admincomment",
  "token",
  "secret",
  "refresh_token",
  "access_token",
] as const;

/** Проверяет только заголовок CSV (не содержимое ячеек — там могут быть типы заданий вроде PASSWORD_ANALYSIS). */
export function assertCsvExportSafe(csv: string, exportType: AdminExportType): void {
  const headerLine = csv.split(/\r?\n/)[0]?.replace(/^\uFEFF/, "").toLowerCase() ?? "";
  for (const needle of ADMIN_EXPORT_FORBIDDEN_CSV_SUBSTRINGS) {
    if (headerLine.includes(needle)) {
      throw new Error(`CSV export ${exportType} contains forbidden column: ${needle}`);
    }
  }
}
