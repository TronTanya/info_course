#!/usr/bin/env node
/**
 * Проверка порогов Lighthouse (JSON-отчёт).
 * Использование: node scripts/check-lighthouse-budget.mjs ./lighthouse-landing.json
 *
 * Переменные: LH_MIN_PERF (0–1), LH_MIN_A11Y (0–1), LH_MAX_CLS (unitless)
 */
import fs from "node:fs";

const reportPath = process.argv[2] ?? "lighthouse-landing.json";
if (!fs.existsSync(reportPath)) {
  console.error(`Lighthouse report not found: ${reportPath}`);
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const categories = report.categories ?? {};

const perf = categories.performance?.score ?? 0;
const a11y = categories.accessibility?.score ?? 0;

const clsAudit = report.audits?.["cumulative-layout-shift"];
const cls = typeof clsAudit?.numericValue === "number" ? clsAudit.numericValue : null;

const minPerf = Number(process.env.LH_MIN_PERF ?? "0.58");
const minA11y = Number(process.env.LH_MIN_A11Y ?? "0.88");
const maxCls = Number(process.env.LH_MAX_CLS ?? "0.12");

const failures = [];

if (perf < minPerf) {
  failures.push(`performance ${(perf * 100).toFixed(0)} < ${(minPerf * 100).toFixed(0)}`);
}
if (a11y < minA11y) {
  failures.push(`accessibility ${(a11y * 100).toFixed(0)} < ${(minA11y * 100).toFixed(0)}`);
}
if (cls !== null && cls > maxCls) {
  failures.push(`CLS ${cls.toFixed(3)} > ${maxCls}`);
}

console.log(
  `Lighthouse: performance=${(perf * 100).toFixed(0)} accessibility=${(a11y * 100).toFixed(0)}` +
    (cls !== null ? ` CLS=${cls.toFixed(3)}` : ""),
);

if (failures.length > 0) {
  console.error("Budget check failed:");
  for (const line of failures) {
    console.error(`  - ${line}`);
  }
  process.exit(1);
}

console.log("Lighthouse budgets OK");
