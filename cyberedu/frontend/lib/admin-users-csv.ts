import type { AdminUserListRow } from "@/lib/admin-users-list";

function csvCell(value: string): string {
  const s = value.replace(/\r\n|\r|\n/g, " ");
  if (s.includes('"') || s.includes(";") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** CSV с разделителем `;` и BOM для Excel (UTF-8). */
export function adminUsersToCsv(rows: AdminUserListRow[]): string {
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
    "Строк отчёта course_progress",
  ];
  const lines = [header.join(";")];
  for (const r of rows) {
    const reg = new Date(r.createdAt).toLocaleDateString("ru-RU");
    const cert = r.hasCertificate ? "Да" : "Нет";
    const progress = r.role === "USER" ? String(r.overallProgressPercent) : "";
    const score = r.role === "USER" ? String(r.totalScore) : "";
    lines.push(
      [
        csvCell(r.fullName),
        csvCell(r.email),
        csvCell(r.role),
        csvCell(r.educationalInstitution),
        csvCell(r.studyGroup),
        csvCell(r.studyCourseYear),
        csvCell(r.specialty),
        csvCell(reg),
        csvCell(progress),
        csvCell(score),
        csvCell(cert),
        csvCell(String(r.courseProgressRowCount)),
      ].join(";"),
    );
  }
  return `\uFEFF${lines.join("\r\n")}`;
}
