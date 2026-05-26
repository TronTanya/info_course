import { expect, test } from "@playwright/test";
import { resetAuthStorage } from "../../e2e/helpers/auth";

test.describe("Password reset form validation", () => {
  test.beforeEach(async ({ context }) => {
    await resetAuthStorage(context);
  });

  test("forgot password shows email errors client-side", async ({ page }) => {
    await page.goto("/auth/forgot-password", { waitUntil: "load" });

    await page.getByRole("button", { name: /отправить ссылку/i }).click();
    await expect(page.getByRole("alert").filter({ hasText: /^Укажите email$/i })).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/forgot-password/);

    await page.getByLabel(/^email$/i).fill("not-email");
    await page.getByRole("button", { name: /отправить ссылку/i }).click();
    await expect(page.getByRole("alert").filter({ hasText: /некорректный email/i })).toBeVisible();
  });

  test("reset password shows field errors without token in URL", async ({ page }) => {
    await page.goto("/auth/reset-password", { waitUntil: "load" });
    await expect(page.getByRole("heading", { name: /ссылка недействительна/i })).toBeVisible();
  });

  test("reset password validates password fields client-side", async ({ page }) => {
    await page.goto("/auth/reset-password?token=e2e-test-token", { waitUntil: "load" });

    await page.getByRole("button", { name: /сохранить пароль/i }).click();
    await expect(page.getByText(/минимум 8 символов|введите пароль|пароль должен/i).first()).toBeVisible();

    await page.getByLabel(/^новый пароль$/i).fill("Password1");
    await page.getByLabel(/^подтверждение пароля$/i).fill("Password2");
    await page.getByRole("button", { name: /сохранить пароль/i }).click();
    await expect(page.getByText(/пароли должны совпадать/i)).toBeVisible();
    await expect(page).toHaveURL(/token=e2e-test-token/);
  });
});
