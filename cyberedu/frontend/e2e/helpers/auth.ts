import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { getE2eCredentials, type E2eRole } from "../test-credentials";

export async function loginAs(page: Page, role: E2eRole): Promise<void> {
  const { email, password } = getE2eCredentials(role);
  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Пароль").fill(password);
  await page.getByRole("button", { name: "Войти" }).click();

  if (role === "admin") {
    await expect(page).toHaveURL(/\/admin/, { timeout: 30_000 });
  } else {
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
  }
}

export async function logoutFromApp(page: Page): Promise<void> {
  const logout = page.getByRole("button", { name: "Выйти" });
  await expect(logout).toBeVisible({ timeout: 15_000 });
  await logout.click();
  await page.waitForURL((url) => {
    const path = url.pathname;
    return path === "/" || path.startsWith("/auth/");
  }, { timeout: 20_000 });
}
