/** Константы для UI и сервера (без node:fs — безопасно для клиентских бандлов). */
export const PRACTICE_MAX_FILE_BYTES = 10 * 1024 * 1024;

export const PRACTICE_ALLOWED_EXTENSIONS = ["pdf", "docx", "txt", "png", "jpg", "zip"] as const;
export type PracticeStoredExt = (typeof PRACTICE_ALLOWED_EXTENSIONS)[number];

export type PracticeUploadLimits = {
  maxBytes: number;
  allowedExts: readonly PracticeStoredExt[];
};

export function defaultPracticeUploadLimits(): PracticeUploadLimits {
  return { maxBytes: PRACTICE_MAX_FILE_BYTES, allowedExts: PRACTICE_ALLOWED_EXTENSIONS };
}

/** Парсинг списка расширений из админки (pdf, docx; txt …). */
export function parseTaskAllowedFileTypes(raw: string | null | undefined): readonly PracticeStoredExt[] {
  if (!raw?.trim()) return PRACTICE_ALLOWED_EXTENSIONS;
  const allowed = new Set<string>(PRACTICE_ALLOWED_EXTENSIONS as readonly string[]);
  const parts = raw
    .split(/[,;\s]+/)
    .map((s) => s.replace(/^\./, "").trim().toLowerCase())
    .filter(Boolean)
    .map((p) => (p === "jpeg" ? "jpg" : p));
  const picked = [...new Set(parts.filter((p) => allowed.has(p)))] as PracticeStoredExt[];
  return picked.length > 0 ? picked : [...PRACTICE_ALLOWED_EXTENSIONS];
}

export function practiceUploadLimitsFromTask(task: {
  allowedFileTypes: string | null;
  maxFileSizeMb: number | null;
}): PracticeUploadLimits {
  const mb =
    task.maxFileSizeMb == null
      ? Math.round(PRACTICE_MAX_FILE_BYTES / (1024 * 1024))
      : Math.min(100, Math.max(1, task.maxFileSizeMb));
  return {
    maxBytes: mb * 1024 * 1024,
    allowedExts: parseTaskAllowedFileTypes(task.allowedFileTypes),
  };
}

export function fileInputAcceptFromExts(exts: readonly PracticeStoredExt[]): string {
  const parts: string[] = [];
  for (const e of exts) {
    if (e === "jpg") {
      parts.push(".jpg", ".jpeg", "image/jpeg");
    } else if (e === "png") {
      parts.push(".png", "image/png");
    } else if (e === "pdf") {
      parts.push(".pdf", "application/pdf");
    } else if (e === "docx") {
      parts.push(".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    } else if (e === "txt") {
      parts.push(".txt", "text/plain");
    } else if (e === "zip") {
      parts.push(".zip", "application/zip");
    }
  }
  return [...new Set(parts)].join(",");
}

export function allowedTypesHuman(exts: readonly PracticeStoredExt[]): string {
  return exts.map((e) => e.toUpperCase()).join(", ");
}
