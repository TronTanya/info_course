import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

loadEnv({ path: ".env", quiet: true });

function resolvePlaywrightBaseUrl(): string {
  const explicit = process.env.PLAYWRIGHT_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const authUrl = process.env.AUTH_URL?.trim();
  if (authUrl) {
    return authUrl.replace(/\/$/, "");
  }

  return "http://localhost:3100";
}

const baseURL = resolvePlaywrightBaseUrl();
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: ["**/*.spec.ts"],
  testIgnore: [
    "tests/prod-smoke/**/*.spec.ts",
    "tests/a11y/**/*.spec.ts",
    "tests/visual/**/*.spec.ts",
    "**/*.prod.spec.ts",
    "**/.next/**",
    "**/node_modules/**",
    "**/e2e-results/**",
  ],
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [["github"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"], ["html", { open: "on-failure", outputFolder: "playwright-report" }]],
  globalSetup: "./e2e/global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: isCI ? "retain-on-failure" : "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 15_000,
    ...devices["Desktop Chrome"],
  },
  outputDir: "e2e-results",
  snapshotPathTemplate: "e2e-results/snapshots/{testFilePath}/{arg}{ext}",
  projects: [
    {
      name: "smoke",
      grep: /@smoke/,
      fullyParallel: false,
      workers: 1,
      use: { viewport: { width: 1280, height: 720 } },
    },
    {
      name: "desktop",
      grepInvert: /@smoke/,
      testIgnore: ["**/errors/api-error-mock.spec.ts"],
      use: { viewport: { width: 1280, height: 720 } },
    },
    {
      name: "mobile",
      grepInvert: /@smoke/,
      testIgnore: [
        "**/errors/api-error-mock.spec.ts",
        "**/admin/admin-routes.smoke.spec.ts",
        "**/admin-users-visibility.spec.ts",
        "**/admin-reviews-visibility.spec.ts",
      ],
      use: {
        ...devices["iPhone 13"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});
