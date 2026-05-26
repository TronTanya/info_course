import { expect, test } from "@playwright/test";
import { resetAuthStorage } from "../../e2e/helpers/auth";

test.describe("Login form validation", () => {
  test.beforeEach(async ({ context }) => {
    await resetAuthStorage(context);
  });

  test("shows field errors before submit without calling sign-in", async ({ page }) => {
    await page.goto("/auth/login", { waitUntil: "load" });

    await page.getByRole("button", { name: /^войти$/i }).click();

    await expect(page.getByText(/укажите email/i)).toBeVisible();
    await expect(page.getByText(/введите пароль/i)).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);

    await page.getByLabel(/^email$/i).fill("not-an-email");
    await page.getByLabel(/^пароль$/i).fill("x");
    await page.getByRole("button", { name: /^войти$/i }).click();

    await expect(page.getByText(/некорректный email/i)).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
