import path from "node:path";

/** Запрещённые расширения (исполняемые, скрипты, web shells). */
export const FORBIDDEN_UPLOAD_EXTENSIONS = new Set([
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
  "svg",
  "svgz",
  "html",
  "htm",
]);

export function assertSafeUploadFilename(originalName: string): { ok: true; base: string } | { ok: false; error: string } {
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
    if (seg && FORBIDDEN_UPLOAD_EXTENSIONS.has(seg)) {
      return { ok: false, error: "Такой тип файла не допускается." };
    }
  }
  return { ok: true, base };
}

export function safeFileExtension(filename: string): string {
  const base = path.basename(filename).replace(/\\/g, "/");
  const i = base.lastIndexOf(".");
  if (i < 0 || i === base.length - 1) return "";
  return base.slice(i + 1).toLowerCase();
}

function bufStartsWith(buf: Buffer, prefix: number[]): boolean {
  if (buf.length < prefix.length) return false;
  return prefix.every((b, i) => buf[i] === b);
}

/** Доп. проверка: файл не является исполняемым PE/MZ. */
export function rejectExecutableMagic(buf: Buffer): { ok: true } | { ok: false; error: string } {
  if (buf.length >= 2 && buf[0] === 0x4d && buf[1] === 0x5a) {
    return { ok: false, error: "Файл похож на исполняемый (Windows)." };
  }
  if (buf.length >= 4 && buf[0] === 0x7f && buf[1] === 0x45 && buf[2] === 0x4c && buf[3] === 0x46) {
    return { ok: false, error: "Файл похож на исполняемый (ELF)." };
  }
  return { ok: true };
}

export function assertBinaryMatchesExtension(
  buf: Buffer,
  ext: string,
): { ok: true } | { ok: false; error: string } {
  const exec = rejectExecutableMagic(buf);
  if (!exec.ok) return exec;

  switch (ext) {
    case "pdf":
      if (!bufStartsWith(buf, [0x25, 0x50, 0x44, 0x46])) return { ok: false, error: "Файл не похож на PDF." };
      break;
    case "png":
      if (!bufStartsWith(buf, [0x89, 0x50, 0x4e, 0x47])) return { ok: false, error: "Файл не похож на PNG." };
      break;
    case "jpg":
      if (!bufStartsWith(buf, [0xff, 0xd8, 0xff])) return { ok: false, error: "Файл не похож на JPEG." };
      break;
    case "webp":
      if (!bufStartsWith(buf, [0x52, 0x49, 0x46, 0x46])) return { ok: false, error: "Файл не похож на WebP." };
      break;
    case "zip":
    case "docx":
      if (!bufStartsWith(buf, [0x50, 0x4b, 0x03, 0x04]) && !bufStartsWith(buf, [0x50, 0x4b, 0x05, 0x06])) {
        return { ok: false, error: "Файл не похож на ZIP/DOCX." };
      }
      break;
    case "txt": {
      const slice = buf.subarray(0, Math.min(buf.length, 65536));
      if (slice.includes(0)) return { ok: false, error: "Текстовый файл содержит двоичные данные." };
      break;
    }
    default:
      break;
  }
  return { ok: true };
}
