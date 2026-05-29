import { expect, test } from "@playwright/test";

/** Публичный лендинг: контент, отсутствие горизонтального overflow, бюджет CLS. */
test.describe("Public landing", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("hero renders in Russian", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Информационная безопасность/i);
    await expect(page.getByText(/ОС кибербезопасности с AI/i)).toBeVisible();
    await expect(page.locator("#product-heading")).toContainText(/практики кибербезопасности/i);
  });

  test("product section shows program and labs", async ({ page }) => {
    await page.goto("/#product", { waitUntil: "load" });
    await expect(page.locator("#product-heading")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Программа курса/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Разбор фишинга/i })).toBeVisible();
  });

  test("closing section has registration CTA", async ({ page }) => {
    await page.goto("/#start", { waitUntil: "load" });
    await expect(
      page.locator("#start").getByRole("heading", { name: /начните бесплатно/i }),
    ).toBeVisible();
    await expect(page.locator("#start").getByRole("link", { name: /Создать аккаунт/i })).toBeVisible();
  });

  test("no horizontal document overflow", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(400);

    const overflowPx = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth - doc.clientWidth;
    });
    expect(overflowPx).toBeLessThanOrEqual(2);
  });

  test("cumulative layout shift stays within budget", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1200);

    const cls = await page.evaluate(() => {
      let total = 0;
      for (const entry of performance.getEntriesByType("layout-shift")) {
        const shift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
        if (!shift.hadRecentInput) {
          total += shift.value ?? 0;
        }
      }
      return total;
    });

    expect(cls).toBeLessThan(0.12);
  });
});
