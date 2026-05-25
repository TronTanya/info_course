export const ADMIN_EXPORT_TYPES = ["students", "progress", "submissions", "certificates"] as const;

export type AdminExportType = (typeof ADMIN_EXPORT_TYPES)[number];

export const ADMIN_EXPORT_API_PATH = "/api/admin/export" as const;

/** Обратная совместимость со старыми ссылками. */
export const ADMIN_USERS_EXPORT_PATH = "/api/admin/users/export" as const;

export const ADMIN_EXPORT_ANCHOR = "#admin-export" as const;

export const ADMIN_EXPORT_TYPE_LABELS: Record<AdminExportType, string> = {
  students: "Студенты",
  progress: "Прогресс",
  submissions: "Отправки",
  certificates: "Сертификаты",
};

/** Краткое описание состава выгрузки (без PII сверх необходимого). */
export const ADMIN_EXPORT_TYPE_HINTS: Record<AdminExportType, string> = {
  students:
    "ФИО, email, роль, прогресс и сертификат. Email только в этом отчёте. Без паролей и токенов.",
  progress:
    "Прогресс по модулям и course_progress: ID пользователя, флаги этапов, баллы. Без email.",
  submissions:
    "Метаданные практик: статус, баллы, даты. Без текстов ответов, файлов и комментариев проверяющего.",
  certificates:
    "Реестр сертификатов: номер, курс, дата. Без кодов верификации и PDF-URL.",
};

export function parseAdminExportType(raw: string | null | undefined): AdminExportType | null {
  const v = raw?.trim().toLowerCase();
  if (!v) return null;
  return (ADMIN_EXPORT_TYPES as readonly string[]).includes(v) ? (v as AdminExportType) : null;
}

export function adminExportDownloadUrl(type: AdminExportType): string {
  return `${ADMIN_EXPORT_API_PATH}?type=${encodeURIComponent(type)}`;
}

export function adminExportFilename(type: AdminExportType, day: string): string {
  return `cyberedu-${type}-${day}.csv`;
}
