import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  type PracticeStoredExt,
  type PracticeUploadLimits,
  defaultPracticeUploadLimits,
} from "@/lib/practice-file-constants";

/** Запрещённые расширения (даже если фигурируют в составном имени — доп. проверка). */
const FORBIDDEN_EXTENSIONS = new Set([
  "exe",
  "dll",
  "com",
  "bat",
  "cmd",
  "msi",
  "scr",
  "pif",
  "js",
  "mjs",
  "cjs",
  "jar",
  "sh",
  "bash",
  "zsh",
  "ps1",
  "vbs",
  "wsf",
  "hta",
  "php",
  "phtml",
  "asp",
  "aspx",
  "jsp",
  "cgi",
  "pl",
  "py",
  "rb",
  "deb",
  "rpm",
  "dmg",
  "app",
  "wasm",
  "so",
  "dylib",
]);

/** Имя файла: только базовое имя, без путей и управляющих символов. */
export function assertSafeUploadFilename(originalName: string): { ok: true } | { ok: false; error: string } {
  const base = path.basename(String(originalName).replace(/\\/g, "/")).trim();
  if (!base || base.length > 240) {
    return { ok: false, error: "Некорректное или слишком длинное имя файла." };
  }
  if (base.includes("..") || /[\x00-\x1f]/.test(base)) {
    return { ok: false, error: "Некорректное имя файла." };
  }
  const parts = base.toLowerCase().split(".");
  for (let i = 1; i < parts.length; i++) {
    const seg = parts[i];
    if (seg && FORBIDDEN_EXTENSIONS.has(seg)) {
      return { ok: false, error: "Такой тип файла не допускается (исполняемые и скрипты запрещены)." };
    }
  }
  return { ok: true };
}

function bufStartsWith(buf: Buffer, prefix: number[]): boolean {
  if (buf.length < prefix.length) return false;
  return prefix.every((b, i) => buf[i] === b);
}

/** Расширение без точки, нижний регистр; пустая строка если нет. */
export function safeFileExtension(filename: string): string {
  const base = path.basename(filename).replace(/\\/g, "/");
  const i = base.lastIndexOf(".");
  if (i < 0 || i === base.length - 1) return "";
  return base.slice(i + 1).toLowerCase();
}

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
  if (!nameCheck.ok) return nameCheck;

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

  if (kind === "pdf") {
    if (!bufStartsWith(buffer, [0x25, 0x50, 0x44, 0x46])) return { ok: false, error: "Файл не похож на PDF." };
    return { ok: true, ext: "pdf" };
  }
  if (kind === "png") {
    if (!bufStartsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) && !bufStartsWith(buffer, [0x89, 0x50, 0x4e, 0x47])) {
      return { ok: false, error: "Файл не похож на PNG." };
    }
    return { ok: true, ext: "png" };
  }
  if (kind === "jpg") {
    if (!bufStartsWith(buffer, [0xff, 0xd8, 0xff])) return { ok: false, error: "Файл не похож на JPEG." };
    return { ok: true, ext: "jpg" };
  }
  if (kind === "zip" || kind === "docx") {
    if (!bufStartsWith(buffer, [0x50, 0x4b, 0x03, 0x04]) && !bufStartsWith(buffer, [0x50, 0x4b, 0x05, 0x06])) {
      return { ok: false, error: kind === "docx" ? "Файл не похож на DOCX." : "Файл не похож на ZIP." };
    }
    return { ok: true, ext: kind };
  }
  if (kind === "txt") {
    const slice = buffer.subarray(0, Math.min(buffer.length, 65536));
    if (slice.includes(0)) {
      return { ok: false, error: "Текстовый файл содержит недопустимые двоичные данные." };
    }
    return { ok: true, ext: "txt" };
  }

  return { ok: false, error: "Неподдерживаемый тип файла." };
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

