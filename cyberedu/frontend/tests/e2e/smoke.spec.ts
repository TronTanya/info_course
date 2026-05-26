import { expect, test } from "@playwright/test";
import {
  assertAdminRouteBlocked,
  assertLoggedOut,
  attachAuthDebug,
  loginAs,
  logout,
  resetAuthStorage,
} from "../../e2e/helpers/auth";
import {
  openFirstPracticePage,
  openFirstTestPage,
  submitModuleTest,
  submitPracticeTextIfPresent,
} from "../../e2e/helpers/course-flow";

test.describe.configure({ mode: "serial" });

test.describe("CyberEdu smoke @smoke", () => {
  test.beforeEach(async ({ context }) => {
    await resetAuthStorage(context);
  });

  test("1. student login", async ({ page }) => {
    await loginAs(page, "student");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("link", { name: "Курс" }).first()).toBeVisible();
  });

  test("2. open dashboard", async ({ page }) => {
    await loginAs(page, "student");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /Привет,/i }).first()).toBeVisible();
  });

  test("3. open course", async ({ page }) => {
    await loginAs(page, "student");
    await page.goto("/dashboard/course");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Повторить|Продолжить|Перейти к сертификату|^Модуль /i }).first(),
    ).toBeVisible();
  });

  test("4. submit module test (no false rate-limit error)", async ({ page }) => {
    test.setTimeout(120_000);
    await loginAs(page, "student");
    await openFirstTestPage(page);
    const submitted = await submitModuleTest(page);
    if (!submitted) {
      await expect(
        page
          .getByRole("button", { name: /Начать тест|Пройти снова|Пройти тест ещё раз/i })
          .or(page.getByText(/Тест уже пройден|Прогресс по ответам|% пройдено/i))
          .first(),
      ).toBeVisible({ timeout: 10_000 });
    }
  });

  test("5. submit practice text (no false rate-limit error)", async ({ page }) => {
    await loginAs(page, "student");
    try {
      await openFirstPracticePage(page);
    } catch {
      test.skip(true, "Практика недоступна без пройденного теста (seed)");
    }
    await expect(page).toHaveURL(/\/dashboard\/course\/[^/]+\/practice/);

    const textarea = page.locator("textarea").first();
    if (await textarea.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await submitPracticeTextIfPresent(page);
      return;
    }

    // TEXT уже сдан / интерактивная практика — достаточно открытой лаборатории без rate-limit ошибки
    await expect(
      page.getByText(/Зачёт|принято|лаборатория завершена|ожидает проверки/i).first(),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/слишком много отправок|слишком много проверок/i)).not.toBeVisible();
  });

  test.describe("logout", () => {
    test.beforeEach(async ({ context }) => {
      await resetAuthStorage(context);
    });

    test.afterEach(async ({ page }, testInfo) => {
      if (testInfo.status !== testInfo.expectedStatus) {
        await attachAuthDebug(page, testInfo);
        const screenshot = await page.screenshot();
        await testInfo.attach("logout-failure.png", {
          body: screenshot,
          contentType: "image/png",
        });
      }
    });

    test("5b. student logout", async ({ page }) => {
      await loginAs(page, "student");
      await logout(page);
      await assertLoggedOut(page);
    });

    test("6. admin logout after users page", async ({ page }, testInfo) => {
      await loginAs(page, "admin");
      await page.goto("/admin/users");
      await expect(page.getByRole("heading", { name: "Пользователи" })).toBeVisible();

      if (testInfo.project.name === "desktop") {
        await page
          .locator("#main-content")
          .getByRole("searchbox", { name: /ФИО, email/i })
          .fill("admin@cyberedu.local");
        await expect(page.getByRole("row", { name: /admin@cyberedu\.local/i })).toBeVisible();
      }

      await logout(page);
      await assertAdminRouteBlocked(page);
    });
  });

  test("7. certificate verify page (public)", async ({ page }) => {
    const code = process.env.E2E_CERT_VERIFY_CODE ?? "VRFY-E2E-INVALID";
    await page.goto(`/certificate/verify/${encodeURIComponent(code)}`);
    await expect(page.getByRole("heading", { name: /Проверка сертификата/i, level: 1 })).toBeVisible();

    if (process.env.E2E_CERT_VERIFY_CODE) {
      await expect(page.getByText(/действителен|подлинн|выдан/i).first()).toBeVisible();
    } else {
      await expect(page.getByText(/не найдена/i)).toBeVisible();
    }
  });

  test("9. dashboard achievements block", async ({ page }) => {
    await loginAs(page, "student");
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Привет,/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Достижения$/i })).toBeVisible();
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
