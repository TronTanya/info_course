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

async function getSessionEmail(page: Page): Promise<string> {
  return page.evaluate(async () => {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    const session = (await res.json()) as { user?: { email?: string } } | null;
    return session?.user?.email ?? "";
  });
}

async function waitForEmptySession(page: Page): Promise<void> {
  await page.waitForLoadState("domcontentloaded");
  await expect.poll(() => getSessionEmail(page), { timeout: 15_000 }).toBe("");
}

export function sidebarLogoutButton(page: Page) {
  return page
    .getByRole("complementary", { name: /навигация (кабинета|админки)/i })
    .getByRole("button", { name: /^выйти$/i });
}

function drawerLogoutFlow(page: Page) {
  const menuTrigger = page.getByRole("button", { name: /открыть меню/i });
  const dialog = page.getByRole("dialog", { name: /^меню$/i });
  const drawerLogout = dialog.getByRole("button", { name: /^выйти$/i });
  return { menuTrigger, dialog, drawerLogout };
}

/**
 * Выход через UI (server action `logoutAction`), как у пользователя.
 * Desktop (lg+, project `desktop`): sidebar «Выйти».
 * <lg: drawer «Открыть меню» → «Выйти».
 */
export async function logout(page: Page): Promise<void> {
  const sidebarLogout = sidebarLogoutButton(page);
  const { menuTrigger, dialog, drawerLogout } = drawerLogoutFlow(page);

  const postLogoutUrl = (url: URL) => {
    const path = url.pathname;
    return path === "/" || path.startsWith("/auth/");
  };

  if (await sidebarLogout.isVisible()) {
    await expect(sidebarLogout).toBeVisible();
    await expect(sidebarLogout).toBeEnabled();
    await sidebarLogout.click();
  } else {
    await expect(menuTrigger).toBeVisible();
    await menuTrigger.click();
    await expect(dialog).toBeVisible();
    await expect(drawerLogout).toBeVisible();
    await expect(drawerLogout).toBeEnabled();
    await drawerLogout.click();
  }

  await expect(page).toHaveURL(postLogoutUrl);
  await waitForEmptySession(page);
}

/** @deprecated Используйте `logout`. */
export async function logoutFromApp(page: Page): Promise<void> {
  await logout(page);
}

/** Проверка, что кабинет недоступен без сессии. */
export async function assertLoggedOut(page: Page): Promise<void> {
  await expect(async () => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/login/);
  }).toPass({ timeout: 15_000 });
}

/** Админ-зона недоступна без роли ADMIN. */
export async function assertAdminRouteBlocked(page: Page): Promise<void> {
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
}
