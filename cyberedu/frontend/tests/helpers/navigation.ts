import { expect, type Page } from "@playwright/test";

const CABINET_NAV = /навигация кабинета/i;
const ADMIN_NAV = /навигация админки/i;

export async function openMobileDrawerIfNeeded(page: Page): Promise<void> {
  const trigger = page.getByRole("button", { name: /открыть меню/i });
  if (await trigger.isVisible().catch(() => false)) {
    await trigger.click();
    await expect(page.getByRole("dialog", { name: /^(меню|кабинет|админка)$/i })).toBeVisible();
  }
}

/** Переход по ссылке в sidebar кабинета (desktop) или drawer (mobile). */
export async function navigateCabinetLink(page: Page, linkName: string | RegExp): Promise<void> {
  const sidebar = page.getByRole("complementary", { name: CABINET_NAV });
  if (await sidebar.isVisible().catch(() => false)) {
    await sidebar.getByRole("link", { name: linkName }).click();
    return;
  }

  await openMobileDrawerIfNeeded(page);
  const dialog = page.getByRole("dialog", { name: /^(меню|кабинет)$/i });
  await dialog.getByRole("link", { name: linkName }).click();
}

export async function navigateAdminLink(page: Page, linkName: string | RegExp): Promise<void> {
  const sidebar = page.getByRole("complementary", { name: ADMIN_NAV });
  if (await sidebar.isVisible().catch(() => false)) {
    await sidebar.getByRole("link", { name: linkName }).click();
    return;
  }

  await openMobileDrawerIfNeeded(page);
  const dialog = page.getByRole("dialog", { name: /^(меню|админка)$/i });
  await dialog.getByRole("link", { name: linkName }).click();
}

/** Dashboard cockpit h1 (v4: «Привет, …»). */
export const DASHBOARD_HEADING = /Привет,/i;

export async function expectDashboardShell(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { name: DASHBOARD_HEADING }).first()).toBeVisible({
    timeout: 20_000,
  });
}
