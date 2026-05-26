import { expect, test } from "@playwright/test";
import path from "node:path";
import { loginAs } from "./helpers/auth";
import { openFirstLessonPage, openFirstPracticePage, openFirstTestPage } from "./helpers/course-flow";

/** PNG для README / защиты — каталог вне frontend (cyberedu/docs/screenshots). */
export const SCREENSHOTS_DIR = path.resolve(__dirname, "../../docs/screenshots");

const shots: { file: string; label: string }[] = [
  { file: "01-landing.png", label: "landing" },
  { file: "09-login.png", label: "login" },
  { file: "02-dashboard.png", label: "student dashboard" },
  { file: "03-course.png", label: "course map" },
  { file: "04-lesson.png", label: "lesson" },
  { file: "05-test.png", label: "module test" },
  { file: "06-practice.png", label: "practice lab" },
  { file: "07-admin.png", label: "admin dashboard" },
  { file: "08-certificate.png", label: "certificate" },
];

test.describe.configure({ mode: "serial" });

test.describe("UX documentation screenshots", () => {
  test("capture screens for docs", async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto("/");
    await expect(page.getByRole("link", { name: /CyberEdu/i }).first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "01-landing.png"), fullPage: true });

    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: /Вход/i })).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "09-login.png") });

    await loginAs(page, "student");

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Привет,/i }).first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "02-dashboard.png") });

    await page.goto("/dashboard/course");
    await expect(page.locator("h1").first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "03-course.png") });

    await openFirstLessonPage(page);
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "04-lesson.png") });

    await openFirstTestPage(page);
    const startTest = page.getByRole("button", { name: /Начать тест/i });
    if (await startTest.isVisible().catch(() => false)) {
      await startTest.click();
      await expect(page.getByText(/Прогресс по ответам|Завершить тест|Вопрос/i).first()).toBeVisible({
        timeout: 15_000,
      });
    } else {
      await expect(
        page.getByText(/Прогресс по ответам|Пройти тест|Завершить тест|Начать тест|Контроль:/i).first(),
      ).toBeVisible();
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "05-test.png") });

    try {
      await openFirstPracticePage(page);
      await expect(page.getByText(/Практика|практик|Лабораторн/i).first()).toBeVisible({ timeout: 15_000 });
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "06-practice.png"), fullPage: true });
    } catch {
      const practiceUrl = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
          .map((a) => a.getAttribute("href"))
          .find((h) => h?.match(/^\/dashboard\/course\/[^/]+\/practice$/)),
      );
      if (practiceUrl) {
        await page.goto(practiceUrl);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "06-practice.png"), fullPage: true });
      }
    }

    await page.goto("/dashboard/certificate");
    await expect(page.getByRole("heading", { name: /Сертификат|сертификат/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "08-certificate.png"), fullPage: true });

    await page.context().clearCookies();
    await loginAs(page, "admin");
    await page.goto("/admin");
    await expect(page.getByRole("heading").first()).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "07-admin.png") });

    for (const { file, label } of shots) {
      await test.info().attach(label, {
        path: path.join(SCREENSHOTS_DIR, file),
        contentType: "image/png",
      });
    }
  });
});
