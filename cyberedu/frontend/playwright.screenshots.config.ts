import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";

/**
 * Генерация UX-скриншотов для docs/screenshots/.
 * Требует запущенное приложение + seed (RUN_SEED=1 или CI migrate/seed).
 *
 *   npm run build && npm run start   # или docker compose
 *   npm run screenshots
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: /screenshots\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL,
    trace: "off",
    screenshot: "off",
    video: "off",
    viewport: { width: 1280, height: 720 },
    ...devices["Desktop Chrome"],
  },
  outputDir: "e2e-results/screenshots-run",
});
