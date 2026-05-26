import { expect, test } from "@playwright/test";
import { loginAs } from "../../../e2e/helpers/auth";
import { openMobileDrawerIfNeeded } from "../../helpers/navigation";

test.describe("Command palette @mobile-nav", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "Только mobile project");
    await loginAs(page, "student");
    await page.goto("/dashboard");
  });

  test("opens from mobile drawer", async ({ page }) => {
    await openMobileDrawerIfNeeded(page);
    const dialog = page.getByRole("dialog", { name: /^кабинет$/i });
    await dialog.getByRole("button", { name: /командная палитра/i }).click();
    await expect(page.getByTestId("command-palette-search")).toBeVisible();
  });
});
