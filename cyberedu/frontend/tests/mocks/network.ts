import type { Page } from "@playwright/test";

/** Offline / 503 для проверки error boundaries и form feedback. */
export async function blockApiHost(page: Page, apiPathPrefix = "/api/"): Promise<void> {
  await page.route(`**${apiPathPrefix}**`, (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "service_unavailable" }),
    }),
  );
}

export async function restoreNetwork(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: "ignoreErrors" });
}
