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
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("link", { name: "Курс" }).first()).toBeVisible();
  });

  test("2. open dashboard", async ({ page }) => {
    await loginAs(page, "student");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /Здравствуйте/i }).first()).toBeVisible();
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
    const submitted = await submitModuleTest(page);
    if (!submitted) {
      await expect(
        page.getByText(/Тест уже пройден|Пройти тест ещё раз|Прогресс по ответам/i).first(),
      ).toBeVisible();
    }
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
    await page.getByPlaceholder(/ФИО, email/i).fill("admin@cyberedu.local");
    await expect(page.getByRole("row", { name: /admin@cyberedu\.local/i })).toBeVisible();
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

  test("9. dashboard achievements block", async ({ page }) => {
    await loginAs(page, "student");
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Здравствуйте/i })).toBeVisible();
    await expect(page.getByText(/Достижения/i).first()).toBeVisible();
  });

  test("10. api health", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as {
      status: string;
      checks?: { database: string; redis?: string };
    };
    expect(body.status).toBe("ok");
    expect(body.checks?.database).toBe("ok");
    // E2E runs with ENVIRONMENT=test — Redis check skipped; prod/staging must report redis ok
    if (body.checks?.redis !== undefined) {
      expect(["ok", "skipped"]).toContain(body.checks.redis);
    }
  });

  test("12. public reviews page", async ({ page }) => {
    await page.goto("/reviews");
    await expect(page.getByRole("heading", { name: "Отзывы" })).toBeVisible();
  });

  test("11. command palette", async ({ page }) => {
    await loginAs(page, "student");
    await page.goto("/dashboard");
    const palette = page.locator("header").getByTestId("command-palette-trigger").first();
    await palette.click();
    await expect(page.getByTestId("command-palette-search").first()).toBeVisible({ timeout: 5000 });
  });
});
