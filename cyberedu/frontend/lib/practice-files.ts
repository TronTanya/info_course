import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
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

export function practiceUploadDir(): string {
  return path.join(process.cwd(), "uploads", "practice");
}

export function practiceFileDiskPath(submissionId: string, ext: PracticeStoredExt): string {
  return path.join(practiceUploadDir(), `${submissionId}.${ext}`);
}

export async function ensurePracticeUploadDir(): Promise<void> {
  const dir = practiceUploadDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export async function findStoredPracticeFile(
  submissionId: string,
): Promise<{ fullPath: string; ext: string } | null> {
  const dir = practiceUploadDir();
  if (!existsSync(dir)) return null;
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(dir);
  const hit = entries.find((e) => e.startsWith(`${submissionId}.`));
  if (!hit) return null;
  const ext = hit.slice(submissionId.length + 1);
  return { fullPath: path.join(dir, hit), ext };
}

export async function savePracticeFile(submissionId: string, ext: PracticeStoredExt, buffer: Buffer): Promise<void> {
  await ensurePracticeUploadDir();
  const p = practiceFileDiskPath(submissionId, ext);
  await writeFile(p, buffer);
}

export function practiceDownloadExists(submissionId: string): boolean {
  const dir = practiceUploadDir();
  if (!existsSync(dir)) return false;
  const entries = readdirSync(dir);
  return entries.some((e) => e.startsWith(`${submissionId}.`));
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

