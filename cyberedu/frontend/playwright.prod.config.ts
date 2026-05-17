import { defineConfig } from "@playwright/test";
import baseConfig from "./playwright.config";

/**
 * Production-like E2E: ENVIRONMENT=production + real Redis + PostgreSQL.
 * Требует запущенное приложение (см. npm run test:e2e:prod:local или CI job e2e-prod-smoke).
 */
const prodTestMatch = ["tests/prod-smoke/**/*.spec.ts", "**/*.prod.spec.ts"];

export default defineConfig({
  ...baseConfig,
  testDir: ".",
  testMatch: prodTestMatch,
  testIgnore: [],
  globalSetup: "./e2e/global-setup.prod.ts",
  timeout: 90_000,
  expect: { timeout: 20_000 },
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never", outputFolder: "playwright-report-prod" }]]
    : [["list"], ["html", { open: "on-failure", outputFolder: "playwright-report-prod" }]],
  outputDir: "e2e-results-prod",
  projects: [
    {
      name: "prod-smoke",
      testMatch: prodTestMatch,
    },
  ],
});
