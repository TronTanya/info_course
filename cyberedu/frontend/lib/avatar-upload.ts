import { existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { assertSafeUploadFilename, safeFileExtension } from "@/lib/practice-files";

const MAX_BYTES = 2 * 1024 * 1024;
/** Пользовательские SVG не принимаем (нет санитизации). Только растровые форматы. */
const ALLOWED = new Set(["png", "jpg", "jpeg", "webp"]);

function bufStartsWith(buf: Buffer, prefix: number[]): boolean {
  if (buf.length < prefix.length) return false;
  return prefix.every((b, i) => buf[i] === b);
}

export type AvatarStoredExt = "png" | "jpg" | "webp";

export type AvatarValidation = { ok: true; ext: AvatarStoredExt } | { ok: false; error: string };

/**
 * Проверка изображения для аватара: размер, расширение, сигнатуры (без SVG и исполняемых типов).
 */
export function validateAvatarImage(buffer: Buffer, originalName: string): AvatarValidation {
  const nameCheck = assertSafeUploadFilename(originalName);
  if (!nameCheck.ok) return nameCheck;

  const rawExt = safeFileExtension(originalName);
  const extLower = rawExt.toLowerCase();
  if (extLower === "svg" || extLower === "svgz") {
    return { ok: false, error: "Загрузка SVG запрещена. Используйте PNG, JPEG или WebP." };
  }

  if (buffer.length === 0) return { ok: false, error: "Пустой файл." };
  if (buffer.length > MAX_BYTES) {
    return { ok: false, error: "Изображение больше 2 МБ." };
  }

  const extCanon = rawExt === "jpeg" ? "jpg" : rawExt;
  if (!extCanon || !ALLOWED.has(extCanon)) {
    return { ok: false, error: "Разрешены только PNG, JPEG и WebP." };
  }

  if (extCanon === "png") {
    if (!bufStartsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) && !bufStartsWith(buffer, [0x89, 0x50, 0x4e, 0x47])) {
      return { ok: false, error: "Файл не похож на PNG." };
    }
    return { ok: true, ext: "png" };
  }
  if (extCanon === "jpg") {
    if (!bufStartsWith(buffer, [0xff, 0xd8, 0xff])) return { ok: false, error: "Файл не похож на JPEG." };
    return { ok: true, ext: "jpg" };
  }
  if (extCanon === "webp") {
    if (
      buffer.length < 12 ||
      !bufStartsWith(buffer, [0x52, 0x49, 0x46, 0x46]) ||
      buffer.toString("ascii", 8, 12) !== "WEBP"
    ) {
      return { ok: false, error: "Файл не похож на WebP." };
    }
    return { ok: true, ext: "webp" };
  }

  return { ok: false, error: "Неподдерживаемый тип файла." };
}

export function avatarUploadDir(): string {
  return path.join(process.cwd(), "uploads", "avatars");
}

export function avatarFileDiskPath(userId: string, ext: AvatarStoredExt): string {
  return path.join(avatarUploadDir(), `${userId}.${ext}`);
}

export async function ensureAvatarUploadDir(): Promise<void> {
  const dir = avatarUploadDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export async function saveUserAvatarFile(userId: string, ext: AvatarStoredExt, buffer: Buffer): Promise<void> {
  await ensureAvatarUploadDir();
  await deleteUserAvatarFiles(userId);
  const p = avatarFileDiskPath(userId, ext);
  await writeFile(p, buffer);
}

export function deleteUserAvatarFiles(userId: string): void {
  const dir = avatarUploadDir();
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (name.startsWith(`${userId}.`)) {
      try {
        unlinkSync(path.join(dir, name));
      } catch {
        /* ignore */
      }
    }
  }
}

export async function findUserAvatarFile(
  userId: string,
): Promise<{ fullPath: string; ext: string } | null> {
  const dir = avatarUploadDir();
  if (!existsSync(dir)) return null;
  const hit = readdirSync(dir).find((e) => e.startsWith(`${userId}.`));
  if (!hit) return null;
  const ext = hit.slice(userId.length + 1);
  return { fullPath: path.join(dir, hit), ext };
}

export function mimeForAvatarExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}
