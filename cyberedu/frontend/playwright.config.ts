import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";

export default defineConfig({
  testDir: ".",
  testMatch: ["tests/e2e/**/*.spec.ts"],
  testIgnore: [
    "tests/prod-smoke/**/*.spec.ts",
    "**/*.prod.spec.ts",
    "**/.next/**",
    "**/node_modules/**",
    "**/e2e-results/**",
  ],
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"], ["html", { open: "on-failure", outputFolder: "playwright-report" }]],
  globalSetup: "./e2e/global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: process.env.CI ? "retain-on-failure" : "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    ...devices["Desktop Chrome"],
  },
  outputDir: "e2e-results",
  snapshotPathTemplate: "e2e-results/snapshots/{testFilePath}/{arg}{ext}",
  projects: [
    {
      name: "desktop",
      testMatch: ["tests/e2e/**/*.spec.ts"],
      use: {
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "mobile",
      testMatch: ["tests/e2e/**/*.spec.ts"],
      use: {
        ...devices["iPhone 13"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});
