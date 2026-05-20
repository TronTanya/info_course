import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** TTF с полной кириллицей (WOFF-subset ломает динамический текст в @react-pdf). */
const FONT_FILES = {
  regular: "DejaVuSans.ttf",
  bold: "DejaVuSans-Bold.ttf",
} as const;

/** Версия шаблона: при смене старые PDF на диске пересобираются при скачивании. */
export const CERTIFICATE_PDF_TEMPLATE_REV = 5;

let fontsRegistered = false;

type PdfFontModule = {
  register: (descriptor: {
    family: string;
    fonts: { src: string; fontWeight: number | string }[];
  }) => void;
};

function fontSearchDirs(): string[] {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return [
    path.join(process.cwd(), "node_modules/dejavu-fonts-ttf/ttf"),
    path.join(process.cwd(), "frontend/node_modules/dejavu-fonts-ttf/ttf"),
    path.join(here, "../node_modules/dejavu-fonts-ttf/ttf"),
  ];
}

export function resolveCertificatePdfFont(name: keyof typeof FONT_FILES): string {
  const file = FONT_FILES[name];
  for (const dir of fontSearchDirs()) {
    const full = path.join(dir, file);
    if (existsSync(full)) return full;
  }
  throw new Error(
    `PDF font ${file} not found (cwd=${process.cwd()}). Run npm install dejavu-fonts-ttf or rebuild Docker image.`,
  );
}

/** @deprecated use resolveCertificatePdfFont */
export function resolveRobotoPdfFont(name: keyof typeof FONT_FILES): string {
  return resolveCertificatePdfFont(name);
}

/** Регистрация в том же экземпляре Font, что использует renderToBuffer. */
export function registerCertificatePdfFonts(Font: PdfFontModule): void {
  if (fontsRegistered) return;
  Font.register({
    family: "CertificateSans",
    fonts: [
      { src: resolveCertificatePdfFont("regular"), fontWeight: 400 },
      { src: resolveCertificatePdfFont("bold"), fontWeight: 700 },
    ],
  });
  fontsRegistered = true;
}
