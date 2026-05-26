import { expect, test } from "@playwright/test";
import { gotoStable, reduceMotion } from "../../helpers/hydration";

test.describe("Public error handling", () => {
  test.beforeEach(async ({ page }) => {
    await reduceMotion(page);
  });

  test("unknown certificate code shows not found", async ({ page }) => {
    await gotoStable(page, "/certificate/verify/VRFY-E2E-NOT-FOUND-000");
    await expect(page.getByRole("heading", { name: /Проверка сертификата/i, level: 1 })).toBeVisible();
    await expect(page.getByText(/не найдена/i)).toBeVisible();
  });

  test("protected dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
  });

  test("admin users redirects unauthenticated visitor", async ({ page }) => {
    await page.goto("/admin/users", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
  });
});
