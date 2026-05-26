import { expect, test } from "@playwright/test";

/**
 * Read-only smoke against a deployed environment.
 * Run manually: PLAYWRIGHT_LIVE_URL=https://your-domain E2E_STUDENT_EMAIL=... E2E_STUDENT_PASSWORD=... npx playwright test tests/prod-smoke/live-readonly.spec.ts
 */
const liveBase = process.env.PLAYWRIGHT_LIVE_URL?.trim().replace(/\/$/, "");

test.describe("Live production smoke (read-only)", () => {
  test.skip(!liveBase, "Set PLAYWRIGHT_LIVE_URL to run live smoke");

  test.use({ baseURL: liveBase });

  test("health endpoint", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ok");
  });

  test("landing loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("certificate verify invalid code", async ({ page }) => {
    await page.goto("/certificate/verify/VRFY-LIVE-SMOKE-INVALID");
    await expect(page.getByText(/не найдена/i)).toBeVisible();
  });

  test("authenticated dashboard (optional credentials)", async ({ page }) => {
    const email = process.env.E2E_STUDENT_EMAIL?.trim();
    const password = process.env.E2E_STUDENT_PASSWORD;
    test.skip(!email || !password, "E2E_STUDENT_EMAIL/PASSWORD required for live login");

    const csrfRes = await page.request.get("/api/auth/csrf");
    expect(csrfRes.ok()).toBeTruthy();
    const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
    const signInRes = await page.request.post("/api/auth/callback/credentials", {
      form: {
        csrfToken,
        email: email as string,
        password: password as string,
        redirect: "false",
        json: "true",
      },
    });
    expect(signInRes.ok()).toBeTruthy();

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Привет,|Центр управления/i }).first()).toBeVisible({
      timeout: 20_000,
    });
  });
});
