import type { BrowserContext, Page } from "@playwright/test";
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
  await expect(sidebarLogoutButton(page)).toBeVisible();
}

/** Изоляция storage между student/admin logout (serial suite, один worker). */
export async function resetAuthStorage(context: BrowserContext): Promise<void> {
  await context.clearCookies();
  for (const p of context.pages()) {
    await p.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}

export async function getSessionEmail(page: Page): Promise<string> {
  return page.evaluate(async () => {
    const res = await fetch("/api/auth/session", {
      credentials: "include",
      cache: "no-store",
    });
    const session = (await res.json()) as { user?: { email?: string } } | null;
    return session?.user?.email ?? "";
  });
}

export async function waitForEmptySession(page: Page): Promise<void> {
  await expect
    .poll(() => getSessionEmail(page), {
      timeout: 15_000,
      message: "NextAuth session should be empty after logout",
    })
    .toBe("");
}

export function sidebarLogoutButton(page: Page) {
  return page
    .getByRole("complementary", { name: /навигация (кабинета|админки)/i })
    .getByRole("button", { name: /^выйти$/i });
}

/**
 * Диагностический signOut через Auth.js API (не использовать в основном smoke).
 * Полезен при разборе расхождения UI logout vs session cookie.
 */
export async function signOutViaApiDiagnostic(page: Page): Promise<void> {
  const csrfRes = await page.request.get("/api/auth/csrf");
  if (!csrfRes.ok()) return;
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
  await page.request.post("/api/auth/signout", {
    form: { csrfToken, callbackUrl: "/auth/login", json: "true" },
  });
}

/**
 * Выход через UI (server action `logoutAction`), как у пользователя.
 * Desktop (lg+, project `desktop`): sidebar «Выйти».
 * <lg: drawer «Открыть меню» → «Выйти».
 */
export async function logout(page: Page): Promise<void> {
  const sidebar = sidebarLogoutButton(page);
  const mobileTrigger = page.getByRole("button", { name: /открыть меню/i });

  if (await sidebar.isVisible()) {
    await expect(sidebar).toBeEnabled();
    await Promise.all([
      page.waitForURL(/\/auth\/login|\/$/, { timeout: 15_000 }).catch(() => null),
      sidebar.click(),
    ]);
  } else {
    await expect(mobileTrigger).toBeVisible();
    await mobileTrigger.click();

    const dialog = page.getByRole("dialog", { name: /^меню$/i });
    await expect(dialog).toBeVisible();

    const drawerLogout = dialog.getByRole("button", { name: /^выйти$/i });
    await expect(drawerLogout).toBeVisible();
    await expect(drawerLogout).toBeEnabled();

    await Promise.all([
      page.waitForURL(/\/auth\/login|\/$/, { timeout: 15_000 }).catch(() => null),
      drawerLogout.click(),
    ]);
  }

  await waitForEmptySession(page);
}

/** @deprecated Используйте `logout`. */
export async function logoutFromApp(page: Page): Promise<void> {
  await logout(page);
}

/** Проверка, что кабинет недоступен без сессии. */
export async function assertLoggedOut(page: Page): Promise<void> {
  await waitForEmptySession(page);

  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
}

/** Админ-зона недоступна без роли ADMIN. */
export async function assertAdminRouteBlocked(page: Page): Promise<void> {
  await waitForEmptySession(page);
  await page.goto("/admin/users", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
}

/** Вложение для отладки падений logout (без значений cookies). */
export async function attachAuthDebug(page: Page, testInfo: { attach: (name: string, body: { body: string; contentType: string }) => Promise<void> }): Promise<void> {
  const sessionEmail = await getSessionEmail(page).catch(() => "session-read-failed");
  const cookies = await page.context().cookies();
  await testInfo.attach("auth-debug.json", {
    body: JSON.stringify(
      {
        url: page.url(),
        sessionEmail,
        cookieNames: cookies.map((c) => c.name),
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
}
