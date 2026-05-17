#!/usr/bin/env node
/** Копирует PNG из cyberedu/docs/screenshots → frontend/public/screenshots для landing. */
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const src = path.join(root, "docs/screenshots");
const dest = path.join(root, "frontend/public/screenshots");

if (!existsSync(src)) {
  console.error("copy-screenshots: source missing:", src);
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
const pngs = readdirSync(src).filter((f) => f.endsWith(".png"));
for (const file of pngs) {
  cpSync(path.join(src, file), path.join(dest, file), { force: true });
}
console.log(`copy-screenshots: ${pngs.length} file(s) → public/screenshots/`);
