import { expect, test } from "../../fixtures";
import { openFirstPracticePage } from "../../helpers";
import { mockJsonRoute, unmockRoutes } from "../../mocks/api-routes";

test.describe("API error surfaces in UI", () => {
  test.afterEach(async ({ page }) => {
    await unmockRoutes(page);
  });

  test("practice upload shows error on 429 mock", async ({ studentPage }) => {
    try {
      await openFirstPracticePage(studentPage);
    } catch {
      test.skip(true, "Practice unavailable");
    }

    const fileInput = studentPage.locator('input[type="file"]').first();
    if (!(await fileInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, "No file upload UI in seed");
    }

    await mockJsonRoute(studentPage, "**/api/practice/upload-file", {
      status: 429,
      body: { ok: false, error: "Слишком много загрузок. Попробуйте позже." },
    });

    const { createTempUploadFile } = await import("../../helpers/uploads");
    await fileInput.setInputFiles(createTempUploadFile());
    await studentPage.getByRole("button", { name: /^проверить$/i }).click();

    await expect(
      studentPage.getByText(/слишком много|попробуйте позже|ошибка загрузки/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
