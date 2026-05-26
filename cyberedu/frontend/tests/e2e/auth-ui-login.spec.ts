import { expect, test } from "@playwright/test";
import { resetAuthStorage } from "../../e2e/helpers/auth";

test.describe("Login form UI", () => {
  test.beforeEach(async ({ context }) => {
    await resetAuthStorage(context);
    await context.request.post("/api/dev/e2e-reset-auth", {
      data: { emails: ["admin@cyberedu.local", "student@cyberedu.local"] },
    });
  });

  test("admin demo credentials via form submit", async ({ page }) => {
    await page.goto("/auth/login", { waitUntil: "networkidle" });
    await page.getByLabel(/^email$/i).fill("admin@cyberedu.local");
    await page.getByLabel(/^пароль$/i).fill("Admin12345!");
    await page.getByRole("button", { name: /^войти$/i }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /панель управления/i })).toBeVisible();
  });

  test("student demo credentials via form submit", async ({ page }) => {
    await page.goto("/auth/login", { waitUntil: "networkidle" });
    await page.getByLabel(/^email$/i).fill("student@cyberedu.local");
    await page.getByLabel(/^пароль$/i).fill("Student12345!");
    await page.getByRole("button", { name: /^войти$/i }).click();
    await expect(page).toHaveURL(/\/(dashboard|auth\/verify-email)/, { timeout: 20_000 });
  });
});
