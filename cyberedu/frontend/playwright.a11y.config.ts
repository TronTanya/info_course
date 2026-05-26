import baseConfig from "./playwright.config";

/** Быстрые axe-проверки критичных маршрутов (без visual snapshots). */
export default {
  ...baseConfig,
  testMatch: ["tests/a11y/**/*.spec.ts"],
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  projects: [
    {
      name: "a11y",
      testMatch: ["tests/a11y/**/*.spec.ts"],
      use: { viewport: { width: 1280, height: 720 } },
    },
  ],
};
