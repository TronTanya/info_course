import { expect, test } from "@playwright/test";
import { loginAs, resetAuthStorage } from "../../e2e/helpers/auth";

test.describe("Admin reviews table visibility", () => {
  test.beforeEach(async ({ context }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Таблица отзывов — только desktop (md+); на mobile — карточки",
    );
    await resetAuthStorage(context);
  });

  test("table text stays readable; table scroll is bounded", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/reviews");
    await expect(page.getByRole("heading", { name: "Отзывы", level: 1 })).toBeVisible();

    const wrap = page.getByTestId("admin-reviews-table-wrap");
    await expect(wrap).toBeVisible({ timeout: 15_000 });
    await expect(wrap.locator("tbody tr").first()).toBeVisible({ timeout: 15_000 });

    const firstAuthorCell = wrap.locator("tbody tr").first().locator("td").nth(2);
    await expect(firstAuthorCell).toBeVisible();

    const metrics = await page.evaluate(() => {
      const wrapEl = document.querySelector('[data-testid="admin-reviews-table-wrap"]');
      const tr = wrapEl?.querySelector(".ce-admin-reviews-data tbody tr");
      const cell = tr?.querySelector("td:nth-child(3)");
      const shell = document.querySelector(".ce-admin-shell");
      if (!wrapEl || !tr || !cell || !shell) return { error: "missing nodes" };
      return {
        rowCount: wrapEl?.querySelectorAll(".ce-admin-reviews-data tbody tr").length ?? 0,
        wrapScrollHeight: wrapEl.scrollHeight,
        wrapClientHeight: wrapEl.clientHeight,
        rowHeight: tr.getBoundingClientRect().height,
        shellBackdrop: getComputedStyle(shell).backdropFilter,
        cellOpacity: getComputedStyle(cell).opacity,
        cellColor: getComputedStyle(cell).color,
      };
    });

    expect(metrics.rowCount).toBeLessThanOrEqual(25);
    expect(metrics.rowCount).toBeGreaterThan(0);
    expect(metrics.wrapScrollHeight).toBeLessThan(8000);
    expect(metrics.rowHeight).toBeLessThan(160);
    expect(metrics.shellBackdrop).toBe("none");
    expect(metrics.cellOpacity).toBe("1");

    await wrap.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(200);

    const afterScroll = await firstAuthorCell.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { opacity: cs.opacity, color: cs.color, text: el.textContent?.trim().slice(0, 20) };
    });
    expect(afterScroll.opacity).toBe("1");
    expect(afterScroll.text?.length).toBeGreaterThan(0);
  });
});

test.describe("Admin reviews mobile list", () => {
  test.beforeEach(async ({ context }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Список карточек — только mobile");
    await resetAuthStorage(context);
  });

  test("moderation cards are visible without desktop table", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/reviews");
    await expect(page.getByRole("heading", { name: "Отзывы", level: 1 })).toBeVisible();
    await expect(page.getByTestId("admin-reviews-table-wrap")).toBeHidden();
    await expect(page.locator(".ce-admin-reviews-page").getByText(/Опубликован|Скрыт/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
