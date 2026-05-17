import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { getE2eCredentials, type E2eRole } from "../test-credentials";

/** Стабильный вход для smoke: NextAuth credentials API (без GET-submit формы до гидрации). */
export async function loginAs(page: Page, role: E2eRole): Promise<void> {
  const { email, password } = getE2eCredentials(role);
  const csrfRes = await page.request.get("/api/auth/csrf");
  expect(csrfRes.ok()).toBeTruthy();
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const signInRes = await page.request.post("/api/auth/callback/credentials", {
    form: {
      csrfToken,
      email,
      password,
      redirect: "false",
      json: "true",
    },
  });
  expect(signInRes.ok()).toBeTruthy();

  const dest = role === "admin" ? "/admin" : "/dashboard/profile";
  await page.goto(dest);
  await expect(page).toHaveURL(role === "admin" ? /\/admin/ : /\/dashboard/, { timeout: 15_000 });
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
