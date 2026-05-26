import { expect, test } from "../../fixtures";
import { openFirstLessonPage } from "../../helpers";

test.describe("Course lesson flow", () => {
  test("student opens first lesson from course map", async ({ studentPage }) => {
    await openFirstLessonPage(studentPage);
    await expect(studentPage).toHaveURL(/\/dashboard\/course\/[^/]+\/lesson/);
    await expect(studentPage.locator("h1, h2").first()).toBeVisible();
  });
});
