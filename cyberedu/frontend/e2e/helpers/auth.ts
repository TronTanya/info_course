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

async function getSessionEmail(page: Page): Promise<string> {
  const res = await page.request.get("/api/auth/session");
  const session = (await res.json()) as { user?: { email?: string } } | null;
  return session?.user?.email ?? "";
}

async function waitForEmptySession(page: Page): Promise<void> {
  await expect.poll(() => getSessionEmail(page), { timeout: 15_000 }).toBe("");
}

async function signOutViaApi(page: Page): Promise<void> {
  const csrfRes = await page.request.get("/api/auth/csrf");
  expect(csrfRes.ok()).toBeTruthy();
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const signOutRes = await page.request.post("/api/auth/signout", {
    form: { csrfToken },
    maxRedirects: 10,
  });
  const status = signOutRes.status();
  expect(status >= 200 && status < 400, `signout HTTP ${status}`).toBe(true);
}

/** Server Action logout — тот же путь, что у пользователя; sidebar виден на desktop (lg+). */
async function signOutViaSidebar(page: Page): Promise<void> {
  const logoutBtn = page.getByRole("button", { name: "Выйти" });
  await expect(logoutBtn).toBeVisible({ timeout: 15_000 });
  await logoutBtn.click();
  await page.waitForURL((url) => !/\/dashboard|\/admin/.test(url.pathname), { timeout: 15_000 });
}

/** Проверка, что кабинет недоступен без сессии. */
export async function assertLoggedOut(page: Page): Promise<void> {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
}

/** Админ-зона недоступна без роли ADMIN. */
export async function assertAdminRouteBlocked(page: Page): Promise<void> {
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
}

/**
 * Выход: NextAuth API, при необходимости — кнопка «Выйти» в desktop-sidebar.
 * Не используем mobile drawer («Открыть меню») — он flaky на desktop после admin flow.
 */
export async function logoutFromApp(page: Page): Promise<void> {
  await signOutViaApi(page);
  if ((await getSessionEmail(page)) !== "") {
    await signOutViaSidebar(page);
  }

  await waitForEmptySession(page);

  await page.goto("/auth/login");
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });

  await assertLoggedOut(page);
  await expect(page.getByRole("link", { name: "Войти" })).toBeVisible({ timeout: 15_000 });
}
