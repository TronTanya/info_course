import type { Page, Route } from "@playwright/test";

export type MockJsonOptions = {
  status?: number;
  body?: unknown;
  contentType?: string;
  /** Задержка ответа (мс) для loading states. */
  delayMs?: number;
};

/**
 * Перехват JSON API для детерминированных error states (без Redis hammering).
 */
export async function mockJsonRoute(
  page: Page,
  urlPattern: string | RegExp,
  options: MockJsonOptions,
): Promise<void> {
  const { status = 200, body = {}, contentType = "application/json", delayMs = 0 } = options;

  await page.route(urlPattern, async (route: Route) => {
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
    await route.fulfill({
      status,
      contentType,
      body: JSON.stringify(body),
    });
  });
}

export async function unmockRoutes(page: Page, urlPattern?: string | RegExp): Promise<void> {
  if (urlPattern) {
    await page.unroute(urlPattern);
  } else {
    await page.unrouteAll({ behavior: "ignoreErrors" });
  }
}
