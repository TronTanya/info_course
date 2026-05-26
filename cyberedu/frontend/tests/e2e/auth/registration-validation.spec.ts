import { expect, test } from "@playwright/test";
import { resetAuthStorage } from "../../../e2e/helpers/auth";
import { gotoStable } from "../../helpers/hydration";

test.describe("Registration form validation", () => {
  test.beforeEach(async ({ context }) => {
    await resetAuthStorage(context);
  });

  test("shows field errors before server action", async ({ page }) => {
    await gotoStable(page, "/auth/register");

    await page.getByRole("button", { name: /создать аккаунт/i }).click();

    await expect(page.getByText(/укажите имя/i).first()).toBeVisible();
    await expect(page.getByText(/укажите email/i).first()).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test("rejects weak password client-side", async ({ page }) => {
    await gotoStable(page, "/auth/register");

    await page.getByLabel("Имя").fill("E2E User");
    await page.getByLabel("Email").fill("weak@cyberedu.local");
    await page.getByLabel("Пароль", { exact: true }).fill("short");
    await page.getByLabel("Подтверждение пароля").fill("short");
    await page.getByRole("checkbox", { name: /согласен/i }).check();
    await page.getByRole("button", { name: /создать аккаунт/i }).click();

    await expect(page.getByText(/минимум 8 символов/i).first()).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/register/);
  });
});
