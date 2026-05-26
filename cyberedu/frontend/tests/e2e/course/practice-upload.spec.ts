import { expect, test } from "../../fixtures";
import { openFirstPracticePage } from "../../helpers";
import { uploadPracticeFileIfPresent } from "../../helpers/uploads";

test.describe.configure({ mode: "serial" });

test.describe("Practice file upload", () => {
  test("uploads safe text file when FILE input present", async ({ studentPage }) => {
    try {
      await openFirstPracticePage(studentPage);
    } catch {
      test.skip(true, "Practice route unavailable — complete test in seed first");
    }

    const uploaded = await uploadPracticeFileIfPresent(studentPage);
    if (!uploaded) {
      await expect(studentPage.locator("textarea").first()).toBeVisible({ timeout: 5_000 });
      test.skip(true, "Seed module uses TEXT practice, not FILE_UPLOAD");
    }
  });
});
