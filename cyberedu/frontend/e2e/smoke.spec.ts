import { expect, test } from "@playwright/test";
import { loginAs, logoutFromApp } from "./helpers/auth";
import {
  openFirstPracticePage,
  openFirstTestPage,
  submitModuleTest,
  submitPracticeTextIfPresent,
} from "./helpers/course-flow";

test.describe.configure({ mode: "serial" });

test.describe("CyberEdu smoke", () => {
  test("1. student login", async ({ page }) => {
    await loginAs(page, "student");
    await expect(page.getByRole("heading", { name: /Профиль|Кабинет/i }).first()).toBeVisible();
  });

  test("2. open dashboard", async ({ page }) => {
    await loginAs(page, "student");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("link", { name: "Курс" }).first()).toBeVisible();
  });

  test("3. open course", async ({ page }) => {
    await loginAs(page, "student");
    await page.goto("/dashboard/course");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Начать|Продолжить|Открыть модуль/i }).first()).toBeVisible();
  });

  test("4. submit module test (no false rate-limit error)", async ({ page }) => {
    await loginAs(page, "student");
    await openFirstTestPage(page);
    await submitModuleTest(page);
  });

  test("5. submit practice text (no false rate-limit error)", async ({ page }) => {
    await loginAs(page, "student");
    try {
      await openFirstPracticePage(page);
    } catch {
      test.skip(true, "Практика недоступна без пройденного теста (seed)");
    }
    await expect(page.getByText(/Практика|практик/i).first()).toBeVisible();
    await submitPracticeTextIfPresent(page);
  });

  test("6. admin login and users page", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { name: "Пользователи" })).toBeVisible();
    await expect(page.getByText(/admin@cyberedu\.local|@cyberedu\.local/i).first()).toBeVisible();
  });

  test("7. certificate verify page (public)", async ({ page }) => {
    const code = process.env.E2E_CERT_VERIFY_CODE ?? "VRFY-E2E-INVALID";
    await page.goto(`/certificate/verify/${encodeURIComponent(code)}`);
    await expect(page.getByRole("heading", { name: /Проверка сертификата/i })).toBeVisible();

    if (process.env.E2E_CERT_VERIFY_CODE) {
      await expect(page.getByText(/действителен|подлинн|выдан/i).first()).toBeVisible();
    } else {
      await expect(page.getByText(/не найдена/i)).toBeVisible();
    }
  });

  test("8. logout", async ({ page }) => {
    await loginAs(page, "student");
    await logoutFromApp(page);
    await expect(page.getByRole("link", { name: "Войти" })).toBeVisible();
  });
});
