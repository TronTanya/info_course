import { defineConfig, devices } from "@playwright/test";

/**
 * Production-like E2E: ENVIRONMENT=production + real Redis + PostgreSQL.
 * Требует запущенное приложение (см. npm run test:e2e:prod:ci или scripts/e2e-prod-local.sh).
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /prod-smoke\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never", outputFolder: "playwright-report-prod" }]]
    : [["list"], ["html", { open: "on-failure", outputFolder: "playwright-report-prod" }]],
  globalSetup: "./e2e/global-setup.prod.ts",
  timeout: 90_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL,
    trace: process.env.CI ? "retain-on-failure" : "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    ...devices["Desktop Chrome"],
  },
  outputDir: "e2e-results-prod",
  projects: [
    {
      name: "prod-smoke",
      testMatch: /prod-smoke\.spec\.ts/,
    },
  ],
});
