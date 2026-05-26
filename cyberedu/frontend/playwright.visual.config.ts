import { defineConfig, devices } from "@playwright/test";
import baseConfig from "./playwright.config";

/**
 * Visual regression — serial, один worker, стабильный viewport.
 * Обновление baseline: npm run test:e2e:visual:update
 */
export default defineConfig({
  ...baseConfig,
  testDir: "tests",
  testMatch: ["visual/**/*.spec.ts"],
  testIgnore: ["**/.next/**", "**/node_modules/**", "e2e/**"],
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  snapshotPathTemplate: "{testDir}/visual/__screenshots__/{testFilePath}/{arg}{ext}",
  expect: {
    ...baseConfig.expect,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.03,
      animations: "disabled",
    },
  },
  projects: [
    {
      name: "visual-desktop",
      testMatch: ["visual/**/*.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
