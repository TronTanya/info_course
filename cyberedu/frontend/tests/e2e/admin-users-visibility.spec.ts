import { expect, test } from "@playwright/test";
import { loginAs, resetAuthStorage } from "../../e2e/helpers/auth";

test.describe("Admin users table visibility", () => {
  test.beforeEach(async ({ context }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile",
      "Таблица пользователей — desktop (md+); на mobile — карточки",
    );
    await resetAuthStorage(context);
  });

  test("table text stays readable after scroll", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { name: "Пользователи", level: 1 })).toBeVisible();

    const wrap = page.getByTestId("admin-data-table-wrap");
    await expect(wrap).toBeVisible({ timeout: 15_000 });
    await expect(wrap.locator('[role="row"].ce-admin-users-grid__body-row').first()).toBeVisible({
      timeout: 15_000,
    });

    const firstNameCell = wrap.locator(".ce-admin-users-grid__name").first();
    await expect(firstNameCell).toBeVisible();

    const metrics = await page.evaluate(() => {
      const wrapEl = document.querySelector('[data-testid="admin-data-table-wrap"]');
      const row = wrapEl?.querySelector('[role="row"].ce-admin-users-grid__body-row');
      const nameCell = wrapEl?.querySelector(".ce-admin-users-grid__name");
      const shell = document.querySelector(".ce-admin-shell");
      if (!wrapEl || !row || !nameCell || !shell) return { error: "missing nodes" };
      return {
        rowCount: wrapEl.querySelectorAll('[role="row"].ce-admin-users-grid__body-row').length,
        wrapScrollHeight: wrapEl.scrollHeight,
        rowHeight: row.getBoundingClientRect().height,
        shellBackdrop: getComputedStyle(shell).backdropFilter,
        cellOpacity: getComputedStyle(nameCell).opacity,
        cellText: nameCell.textContent?.trim().slice(0, 24) ?? "",
      };
    });

    expect(metrics.rowCount).toBeGreaterThan(0);
    expect(metrics.wrapScrollHeight).toBeLessThan(50_000);
    expect(metrics.rowHeight).toBeLessThan(160);
    expect(metrics.shellBackdrop).toBe("none");
    expect(metrics.cellOpacity).toBe("1");
    expect((metrics.cellText ?? "").length).toBeGreaterThan(0);

    await wrap.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(200);

    const afterScroll = await firstNameCell.evaluate((el: HTMLElement) => {
      const cs = getComputedStyle(el);
      return { opacity: cs.opacity, text: el.textContent?.trim().slice(0, 24) ?? "" };
    });
    expect(afterScroll.opacity).toBe("1");
    expect(afterScroll.text.length).toBeGreaterThan(0);
  });
});
