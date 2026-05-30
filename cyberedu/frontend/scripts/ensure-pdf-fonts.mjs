/**
 * Копирует DejaVu TTF в assets/fonts/dejavu для serverless (Vercel не всегда трейсит node_modules).
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "assets", "fonts", "dejavu");
const files = ["DejaVuSans.ttf", "DejaVuSans-Bold.ttf"];

let pkgDir;
try {
  pkgDir = path.join(path.dirname(require.resolve("dejavu-fonts-ttf/package.json")), "ttf");
} catch {
  console.warn("[ensure-pdf-fonts] dejavu-fonts-ttf not installed — skip");
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });
for (const file of files) {
  const src = path.join(pkgDir, file);
  const dest = path.join(outDir, file);
  if (!existsSync(src)) {
    console.warn(`[ensure-pdf-fonts] missing ${src}`);
    continue;
  }
  copyFileSync(src, dest);
}
console.log("[ensure-pdf-fonts] OK → assets/fonts/dejavu");
