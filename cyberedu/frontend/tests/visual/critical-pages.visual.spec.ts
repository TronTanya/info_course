import { expect, test } from "@playwright/test";
import { loginAs, resetAuthStorage } from "../../e2e/helpers/auth";
import { gotoStable, reduceMotion } from "../helpers/hydration";

test.describe.configure({ mode: "serial" });

test.describe("Visual regression — critical pages", () => {
  test.beforeEach(async ({ page }) => {
    await reduceMotion(page);
  });

  test("landing hero", async ({ page }) => {
    await gotoStable(page, "/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page).toHaveScreenshot("landing-hero.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });

  test("login form", async ({ page }) => {
    await gotoStable(page, "/auth/login");
    await expect(page.getByRole("heading", { name: /Вход/i })).toBeVisible();
    await expect(page.locator("form").first()).toHaveScreenshot("auth-login-form.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });

  test("landing product section", async ({ page }) => {
    await gotoStable(page, "/#product");
    await expect(page.locator("#product-heading")).toBeVisible();
    await expect(page.locator("#product")).toHaveScreenshot("landing-product.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.03,
      animations: "disabled",
    });
  });

  test("student dashboard header", async ({ page, context }) => {
    await gotoStable(page, "/auth/login");
    await resetAuthStorage(context);
    await loginAs(page, "student");
    await gotoStable(page, "/dashboard", { expectMain: true });
    await expect(page.getByRole("heading", { name: /Привет,/i }).first()).toBeVisible();
    await expect(page.locator("header").first()).toHaveScreenshot("dashboard-header.png", {
      maxDiffPixelRatio: 0.03,
      animations: "disabled",
    });
  });
});
