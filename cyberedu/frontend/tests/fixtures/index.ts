import { test as base, expect, type Page } from "@playwright/test";
import { loginAs, resetAuthStorage } from "../../e2e/helpers/auth";
import type { E2eRole } from "../../e2e/test-credentials";

type AuthFixtures = {
  /** Страница с активной сессией student (API login, без UI submit). */
  studentPage: Page;
  /** Страница с активной сессией admin. */
  adminPage: Page;
};

async function authenticatedPage(
  page: Page,
  context: import("@playwright/test").BrowserContext,
  role: E2eRole,
): Promise<Page> {
  await resetAuthStorage(context);
  await loginAs(page, role);
  return page;
}

/**
 * Расширенный `test` с фикстурами авторизации.
 *
 * @example
 * import { test, expect } from "../fixtures";
 * test("course map", async ({ studentPage }) => { ... });
 */
export const test = base.extend<AuthFixtures>({
  studentPage: async ({ page, context }, use) => {
    await authenticatedPage(page, context, "student");
    await use(page);
  },

  adminPage: async ({ page, context }, use) => {
    await authenticatedPage(page, context, "admin");
    await use(page);
  },
});

export { expect };
