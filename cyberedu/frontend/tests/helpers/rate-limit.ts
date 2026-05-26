import { expect, type Page } from "@playwright/test";
import { resetServerAuthGuards } from "../../e2e/helpers/verification";

export const RATE_LIMIT_UI = /слишком много отправок|слишком много проверок|слишком много запросов/i;

/** Сброс auth rate limits перед чувствительными сценариями. */
export async function clearAuthRateLimitsForEmails(emails: string[]): Promise<void> {
  await resetServerAuthGuards(emails);
}

export async function expectNoRateLimitBanner(page: Page): Promise<void> {
  await expect(page.getByText(RATE_LIMIT_UI)).not.toBeVisible({ timeout: 5_000 });
}

export async function expectRateLimitOrValidation(page: Page): Promise<void> {
  const rateLimited = page.getByText(RATE_LIMIT_UI);
  const validation = page.getByText(/укажите|введите|некорректн/i);
  await expect(rateLimited.or(validation).first()).toBeVisible({ timeout: 10_000 });
}
