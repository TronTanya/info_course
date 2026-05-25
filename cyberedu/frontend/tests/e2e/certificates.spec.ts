import { expect, test } from "@playwright/test";
import { loginAs, resetAuthStorage } from "../../e2e/helpers/auth";
import { restoreCertificateByNumber } from "../../e2e/helpers/certificate-db";

test.describe.configure({ mode: "serial" });

/**
 * E2E по чеклисту ЭТАП 19 (сертификаты).
 * Требует: приложение на PLAYWRIGHT_BASE_URL, DATABASE_URL + seed (student с выданным CE-…).
 * global-setup подставляет E2E_CERT_VERIFY_NUMBER из БД student@.
 */
test.describe("Certificate flows", () => {
  test.beforeEach(async ({ context }) => {
    await resetAuthStorage(context);
  });

  test("student: dashboard mentions certificate progress", async ({ page }) => {
    await loginAs(page, "student");
    await page.goto("/dashboard");
    await expect(page.getByText(/сертификат/i).first()).toBeVisible();
  });

  test("student: certificate page (issued or eligibility)", async ({ page }) => {
    await loginAs(page, "student");
    await page.goto("/dashboard/certificate");
    await expect(
      page.getByRole("heading", { name: /Ваш сертификат|Официальный сертификат/i }),
    ).toBeVisible();

    const issuedHeading = page.getByRole("heading", { name: "Ваш сертификат" });
    if (await issuedHeading.isVisible()) {
      await expect(page.getByRole("heading", { name: "Поделиться и скачать" })).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Скопировать ссылку проверки/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: /Открыть страницу проверки/i }),
      ).toBeVisible();
      const body = await page.locator("body").innerText();
      expect(body).not.toMatch(/student@cyberedu\.local/i);
    } else {
      await expect(
        page.getByRole("button", { name: /Получить сертификат/i }).or(page.getByText(/требован/i)).first(),
      ).toBeVisible();
    }
  });

  test("public: verify landing", async ({ page }) => {
    await page.goto("/certificate/verify");
    await expect(page.getByRole("heading", { name: "Проверка сертификата" })).toBeVisible();
  });

  test("public: invalid certificate number", async ({ page }) => {
    await page.goto("/verify/CE-2099-INVALID1");
    await expect(page.getByRole("heading", { name: "Сертификат не найден" })).toBeVisible();
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/@[\w.-]+\.(local|edu|ru)/i);
    expect(body).not.toMatch(/progressPercent|userId|verificationCode/i);
  });

  test("public: valid seeded certificate", async ({ page }) => {
    const number = process.env.E2E_CERT_VERIFY_NUMBER?.trim();
    test.skip(!number, "E2E_CERT_VERIFY_NUMBER не задан (DATABASE_URL + seed в global-setup)");

    await page.goto(`/verify/${encodeURIComponent(number!)}`);
    await expect(page.getByRole("heading", { name: "Сертификат подтверждён" })).toBeVisible();
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/student@cyberedu\.local/i);
  });

  test("admin: certificates registry", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/certificates");
    await expect(page.getByRole("heading", { name: /Реестр сертификатов/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Выданные/i }).first()).toBeVisible();
    await expect(page.getByRole("tab", { name: /Готовы к выдаче/i }).first()).toBeVisible();
    const body = await page.locator("main, #main-content").first().innerText().catch(() => "");
    expect(body).not.toMatch(/VRFY-|verificationCode/i);
  });

  test("security: unauthenticated PDF download is rejected", async ({ request }) => {
    const res = await request.get(
      "/api/certificates/download/00000000-0000-0000-0000-000000000099",
    );
    expect([401, 403, 404]).toContain(res.status());
  });
});

test.describe("Certificate revoke (admin + public)", () => {
  const certNumber = process.env.E2E_CERT_VERIFY_NUMBER?.trim();

  test.skip(!certNumber, "E2E_CERT_VERIFY_NUMBER не задан");

  test.beforeAll(async () => {
    if (certNumber) await restoreCertificateByNumber(certNumber);
  });

  test.afterAll(async () => {
    if (certNumber) await restoreCertificateByNumber(certNumber);
  });

  test.beforeEach(async ({ context }) => {
    await resetAuthStorage(context);
  });

  test("admin revokes certificate; public verify shows revoked", async ({ page }) => {
    await loginAs(page, "admin");
    await page.goto("/admin/certificates");

    const search = page.getByPlaceholder(/Поиск: студент/i);
    await search.fill(certNumber!);
    await expect(page.getByText(certNumber!, { exact: false }).first()).toBeVisible({ timeout: 15_000 });

    const row = page.getByRole("row").filter({ hasText: certNumber! }).first();
    await row.getByRole("button", { name: "Отозвать" }).click();

    await expect(page.getByRole("heading", { name: "Отозвать сертификат?" })).toBeVisible();
    await page.locator('button[form="admin-revoke-certificate-form"]').click();

    await expect(page.getByText(/отозван/i).first()).toBeVisible({ timeout: 15_000 });

    await page.goto(`/verify/${encodeURIComponent(certNumber!)}`);
    await expect(page.getByRole("heading", { name: "Сертификат отозван" })).toBeVisible();
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/student@cyberedu\.local/i);
  });
});
