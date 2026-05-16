import {
  type PracticeStoredExt,
  type PracticeUploadLimits,
  defaultPracticeUploadLimits,
} from "@/lib/practice-file-constants";
import {
  assertBinaryMatchesExtension,
  assertSafeUploadFilename,
  safeFileExtension,
} from "@/lib/security/upload-sandbox";
import { getStorageService, namespaceDir } from "@/lib/storage";

export { assertSafeUploadFilename, safeFileExtension } from "@/lib/security/upload-sandbox";

export type FileValidationResult = { ok: true; ext: PracticeStoredExt } | { ok: false; error: string };

/**
 * Проверка размера, расширения из белого списка и сигнатур (исполняемые и «левые» типы отсекаются).
 */
export function validatePracticeUpload(
  buffer: Buffer,
  originalName: string,
  limits: PracticeUploadLimits = defaultPracticeUploadLimits(),
): FileValidationResult {
  const nameCheck = assertSafeUploadFilename(originalName);
  if (!nameCheck.ok) return { ok: false, error: nameCheck.error };

  if (buffer.length === 0) {
    return { ok: false, error: "Пустой файл." };
  }
  if (buffer.length > limits.maxBytes) {
    const mb = Math.round(limits.maxBytes / (1024 * 1024));
    return { ok: false, error: `Файл больше ${mb} МБ.` };
  }

  const rawExt = safeFileExtension(originalName);
  const extCanon = rawExt === "jpeg" ? "jpg" : rawExt;
  if (!extCanon || !(limits.allowedExts as readonly string[]).includes(extCanon)) {
    return {
      ok: false,
      error: `Разрешены только: ${limits.allowedExts.map((e) => e.toUpperCase()).join(", ")}.`,
    };
  }
  const kind = extCanon as PracticeStoredExt;

  const magic = assertBinaryMatchesExtension(buffer, kind);
  if (!magic.ok) return { ok: false, error: magic.error };

  return { ok: true, ext: kind };
}

/** Алиас для единообразия с требованиями к тестам (`validateFileUpload`). */
export const validateFileUpload = validatePracticeUpload;

const PRACTICE_NS = "practice" as const;

export function practiceUploadDir(): string {
  return namespaceDir(PRACTICE_NS);
}

export function practiceFileKey(submissionId: string, ext: PracticeStoredExt): string {
  return `${submissionId}.${ext}`;
}

export function practiceFileDiskPath(submissionId: string, ext: PracticeStoredExt): string {
  return getStorageService().objectPath(PRACTICE_NS, practiceFileKey(submissionId, ext));
}

export async function ensurePracticeUploadDir(): Promise<void> {
  await getStorageService().ensureNamespace(PRACTICE_NS);
}

export async function findStoredPracticeFile(
  submissionId: string,
): Promise<{ fullPath: string; ext: string } | null> {
  const storage = getStorageService();
  const keys = await storage.listKeys(PRACTICE_NS, `${submissionId}.`);
  const hit = keys[0];
  if (!hit) return null;
  const ext = hit.slice(submissionId.length + 1);
  return { fullPath: storage.objectPath(PRACTICE_NS, hit), ext };
}

export async function savePracticeFile(submissionId: string, ext: PracticeStoredExt, buffer: Buffer): Promise<void> {
  const storage = getStorageService();
  await storage.write(PRACTICE_NS, practiceFileKey(submissionId, ext), buffer);
}

export async function deletePracticeFile(submissionId: string): Promise<number> {
  return getStorageService().deleteByPrefix(PRACTICE_NS, `${submissionId}.`);
}

export async function practiceDownloadExists(submissionId: string): Promise<boolean> {
  const keys = await getStorageService().listKeys(PRACTICE_NS, `${submissionId}.`);
  return keys.length > 0;
}

export function mimeForPracticeExt(ext: string): string {
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "txt":
      return "text/plain; charset=utf-8";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}
