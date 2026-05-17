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

/** Выход через NextAuth API — не зависит от sidebar / mobile drawer. */
export async function logoutFromApp(page: Page): Promise<void> {
  const csrfRes = await page.request.get("/api/auth/csrf");
  expect(csrfRes.ok()).toBeTruthy();
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const signOutRes = await page.request.post("/api/auth/signout", {
    form: {
      csrfToken,
      json: "true",
    },
  });
  expect(signOutRes.ok()).toBeTruthy();

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Войти" })).toBeVisible({ timeout: 15_000 });
}
