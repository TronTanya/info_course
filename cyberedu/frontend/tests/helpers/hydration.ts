import type { Page } from "@playwright/test";

export type GotoStableOptions = {
  waitUntil?: "load" | "domcontentloaded" | "commit";
  /** Дождаться #main-content или role=main (кабинет/админка). */
  expectMain?: boolean;
};

/**
 * Навигация без гонки с гидрацией: не кликать submit до client hooks.
 * Для форм auth предпочитайте `credentialsSignIn` из e2e/helpers/auth.
 */
export async function gotoStable(
  page: Page,
  url: string,
  options: GotoStableOptions = {},
): Promise<void> {
  const { waitUntil = "domcontentloaded", expectMain = false } = options;
  await page.goto(url, { waitUntil });

  if (!expectMain) return;

  const main = page.locator("#main-content").or(page.getByRole("main")).first();
  await main.waitFor({ state: "visible", timeout: 20_000 });
}

/** Снижает анимации для стабильных скриншотов и CLS-тестов. */
export async function reduceMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
}
