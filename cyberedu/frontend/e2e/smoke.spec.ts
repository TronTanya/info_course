import { expect, test } from "@playwright/test";
import { loginAs, logoutFromApp } from "./helpers/auth";

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

  test("4. test page — answer one question flow", async ({ page }) => {
    await loginAs(page, "student");
    await page.goto("/dashboard/course");

    const testLink = page.locator('a[href*="/test"]').first();
    if ((await testLink.count()) === 0) {
      const continueLink = page.getByRole("link", { name: /Начать|Продолжить|тест/i }).first();
      await continueLink.click();
    } else {
      await testLink.click();
    }

    await expect(page).toHaveURL(/\/dashboard\/course\/[^/]+\/test/);

    const retake = page.getByRole("button", { name: /Пройти тест ещё раз/i });
    if (await retake.isVisible().catch(() => false)) {
      await retake.click();
    }

    const firstRadio = page.locator('input[type="radio"]').first();
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    const textarea = page.locator("textarea").first();

    if (await firstRadio.isVisible().catch(() => false)) {
      await firstRadio.check();
    } else if (await firstCheckbox.isVisible().catch(() => false)) {
      await firstCheckbox.check();
    } else if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill("E2E smoke answer");
    }

    const nextBtn = page.getByRole("button", { name: /Следующий вопрос/i });
    if (await nextBtn.isEnabled().catch(() => false)) {
      await nextBtn.click();
    }

    await expect(page.getByText(/Вопрос \d+ из/i)).toBeVisible();
  });

  test("5. open practice page", async ({ page }) => {
    await loginAs(page, "student");
    await page.goto("/dashboard/course");

    const practiceLink = page.locator('a[href*="/practice"]').first();
    test.skip((await practiceLink.count()) === 0, "Практика недоступна без пройденного теста (seed)");

    await practiceLink.click();
    await expect(page).toHaveURL(/\/dashboard\/course\/[^/]+\/practice/);
    await expect(page.getByText(/Практика|практик/i).first()).toBeVisible();
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
