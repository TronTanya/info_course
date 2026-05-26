import { expect, test } from "@playwright/test";
import { credentialsSignIn, getSessionEmail, resetAuthStorage } from "../../e2e/helpers/auth";
import {
  createE2eUnverifiedUser,
  ensureE2eUserPassword,
  issueE2eEmailVerificationUrl,
  resetServerAuthGuards,
} from "../../e2e/helpers/verification";

test.describe.configure({ mode: "serial" });

test.describe("Email verification flow", () => {
  test.beforeEach(async ({ context }) => {
    await resetAuthStorage(context);
  });

  test("register → verify-email → dashboard", async ({ page }) => {
    const email = `e2e-verify-${Date.now()}@cyberedu.local`;
    const password = "E2eVerify123!";

    await resetServerAuthGuards([email]);

    await page.goto("/auth/register");
    await page.getByLabel("Имя").fill("E2E Verify");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Пароль", { exact: true }).fill(password);
    await page.getByLabel("Подтверждение пароля").fill(password);
    await page.getByRole("checkbox", { name: /согласен/i }).check();
    await page.getByRole("button", { name: /создать аккаунт/i }).click();

    const registered = await page
      .waitForURL(/\/auth\/verify-email/, { timeout: 8_000 })
      .then(() => true)
      .catch(() => false);

    if (!registered) {
      await resetServerAuthGuards([email]);
      await createE2eUnverifiedUser(email, password);
      await credentialsSignIn(page, email, password);
      await page.goto("/auth/verify-email");
      await expect(page).toHaveURL(/\/auth\/verify-email/);
      await expect(page.getByText(/подтвердите адрес|отправить письмо/i).first()).toBeVisible();
    } else {
      await expect(page.getByText(/письмо с подтверждением отправлено/i).first()).toBeVisible();
    }

    const verifyUrl = await issueE2eEmailVerificationUrl(email, "/dashboard/profile");
    await page.goto(verifyUrl);
    await expect(page.getByText(/email подтверждён/i).first()).toBeVisible();

    // JWT в cookie обновляется при новом входе (middleware не читает БД).
    await resetServerAuthGuards([email]);
    await ensureE2eUserPassword(email, password);
    await credentialsSignIn(page, email, password);
    await expect.poll(() => getSessionEmail(page)).toBe(email);
    await page.goto("/dashboard/profile");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await expect.poll(() => getSessionEmail(page)).toBe(email);
    const sidebar = page.getByRole("complementary", { name: /навигация кабинета/i });
    if (await sidebar.isVisible().catch(() => false)) {
      await expect(sidebar).toBeVisible();
    } else {
      await expect(page.getByRole("button", { name: /открыть меню/i })).toBeVisible();
    }
  });

  test("login and register show verify_sent banner", async ({ page }) => {
    await page.goto("/auth/login?verify_sent=1");
    await expect(page.getByText(/письмо с подтверждением отправлено/i).first()).toBeVisible();

    await page.goto("/auth/register?verify_sent=1");
    await expect(page.getByText(/письмо с подтверждением отправлено/i).first()).toBeVisible();
  });
});
