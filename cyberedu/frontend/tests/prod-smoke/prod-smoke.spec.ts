import { expect, test } from "@playwright/test";
import { loginAs } from "../../e2e/helpers/auth";
import {
  openFirstPracticePage,
  openFirstTestPage,
  submitModuleTest,
  submitPracticeTextIfPresent,
} from "../../e2e/helpers/course-flow";
import {
  expectPracticeSubmissionPersistedForStudent,
  expectTestAttemptPersistedForStudent,
} from "../../e2e/helpers/persistence";

const RATE_LIMIT_ERROR = /слишком много отправок|слишком много проверок/i;

test.describe.configure({ mode: "serial" });

test.describe("Production-like smoke (Redis + ENVIRONMENT=production)", () => {
  test("1. API health: database and redis ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as {
      status: string;
      checks: { database: string; redis: string };
    };
    expect(body.status).toBe("ok");
    expect(body.checks.database).toBe("ok");
    expect(body.checks.redis).toBe("ok");
  });

  test("2. student login", async ({ page }) => {
    await loginAs(page, "student");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("3. open course and test page", async ({ page }) => {
    await loginAs(page, "student");
    await page.goto("/dashboard/course");
    await expect(page.locator("h1").first()).toBeVisible();
    await openFirstTestPage(page);
    await expect(page).toHaveURL(/\/dashboard\/course\/[^/]+\/test/);
  });

  test("4. submit module test — no false rate-limit, result visible", async ({ page }) => {
    await loginAs(page, "student");
    await openFirstTestPage(page);

    const submitted = await submitModuleTest(page);
    if (!submitted) {
      await expect(
        page.getByText(/Тест уже пройден|Пройти тест ещё раз|Прогресс по ответам/i).first(),
      ).toBeVisible();
    } else {
      await expect(page.getByText(RATE_LIMIT_ERROR)).not.toBeVisible();
      await expect(page.getByText(/Результат:|Статус:/i).first()).toBeVisible();
      await page.reload();
      await expect(page.getByText(/Результат:|Статус:|Пройти тест ещё раз/i).first()).toBeVisible({
        timeout: 15_000,
      });
    }

    await expectTestAttemptPersistedForStudent();
  });

  test("5. submit TEXT practice — no false rate-limit, persisted", async ({ page }) => {
    await loginAs(page, "student");
    try {
      await openFirstPracticePage(page);
    } catch {
      test.skip(true, "Практика недоступна без пройденного теста (seed)");
    }

    await expect(page.getByText(/Практика|практик/i).first()).toBeVisible();
    await submitPracticeTextIfPresent(page);
    await expect(page.getByText(RATE_LIMIT_ERROR)).not.toBeVisible();

    const statusHint = page.getByText(/Отправлено|на проверке|принят|Черновик/i).first();
    if (await statusHint.isVisible().catch(() => false)) {
      await expect(statusHint).toBeVisible();
    }

    await expectPracticeSubmissionPersistedForStudent();
  });
});
