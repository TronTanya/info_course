import { expect, test } from "@playwright/test";
import { loginAs, resetAuthStorage } from "../../e2e/helpers/auth";

const ONBOARDING_KEY = "cyberedu_onboarding_v1_done";

async function prepareStudentSession(page: import("@playwright/test").Page) {
  await page.addInitScript((key) => {
    try {
      localStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
  }, ONBOARDING_KEY);
  await loginAs(page, "student");
  await page.goto("/dashboard/profile", { waitUntil: "load" });
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("tab", tab(/обзор/i))).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("heading", { name: /карта навыков/i })).toBeVisible({ timeout: 15_000 });
}

function tab(name: RegExp) {
  return { name };
}

test.describe("Profile portfolio", () => {
  test.beforeEach(async ({ context }) => {
    await resetAuthStorage(context);
  });

  test("shows overview by default and switches tabs with URL sync", async ({ page }) => {
    await prepareStudentSession(page);

    await expect(page.getByRole("tab", tab(/обзор/i))).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText(/обзор прогресса/i).first()).toBeVisible();

    await page.getByRole("tab", tab(/тесты и практика/i)).click();
    await expect(page).toHaveURL(/\/dashboard\/profile\?tab=results/);
    await expect(page.getByRole("tab", tab(/тесты и практика/i))).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: /результаты тестов/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /практические задания/i })).toBeVisible();

    await page.getByRole("tab", tab(/достижения/i)).click();
    await expect(page).toHaveURL(/\/dashboard\/profile\?tab=achievements/);
    await expect(page.getByRole("heading", { name: /^достижения$/i })).toBeVisible();

    await page.getByRole("tab", tab(/сертификат/i)).click();
    await expect(page).toHaveURL(/\/dashboard\/profile\?tab=certificate/);
    await expect(
      page.getByRole("tabpanel").getByRole("heading", { name: /^сертификат$/i }).first(),
    ).toBeVisible();

    await page.getByRole("tab", tab(/обзор/i)).click();
    await expect(page).toHaveURL(/\/dashboard\/profile(?:\?|$)/);
    await expect(page).not.toHaveURL(/tab=/);
    await expect(page.getByRole("tab", tab(/обзор/i))).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: /карта навыков/i })).toBeVisible();
  });

  test("opens achievements tab from query param and legacy hash", async ({ page }) => {
    await prepareStudentSession(page);

    await page.goto("/dashboard/profile?tab=achievements", { waitUntil: "load" });
    await expect(page.getByRole("tab", tab(/достижения/i))).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: /^достижения$/i })).toBeVisible();

    await page.goto("/dashboard/profile#achievements-heading", { waitUntil: "load" });
    await expect(page).toHaveURL(/tab=achievements/);
    await expect(page.getByRole("tab", tab(/достижения/i))).toHaveAttribute("aria-selected", "true");
  });

  test("paginates test results when more than one page", async ({ page }) => {
    await prepareStudentSession(page);

    await page.getByRole("tab", tab(/тесты и практика/i)).click();
    await expect(page.getByRole("heading", { name: /результаты тестов/i })).toBeVisible();

    const rangeLabel = page.getByText(/показано \d+–\d+ из \d+/i);
    const hasPager = await rangeLabel.isVisible().catch(() => false);

    if (!hasPager) {
      test.skip(true, "У seed-студента ≤8 попыток тестов — пагинация не отображается");
    }

    await expect(rangeLabel).toContainText(/показано 1–8 из/i);

    const next = page.getByRole("button", { name: /следующая страница/i });
    await expect(next).toBeEnabled();
    await next.click();

    await expect(rangeLabel).toContainText(/показано 9–/i);

    const prev = page.getByRole("button", { name: /предыдущая страница/i });
    await expect(prev).toBeEnabled();
    await prev.click();
    await expect(rangeLabel).toContainText(/показано 1–8 из/i);
  });
});
