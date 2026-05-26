import { expect, test } from "../../fixtures";
import { expectDashboardShell, navigateCabinetLink } from "../../helpers/navigation";

test.describe("Dashboard navigation", () => {
  test("sidebar links reach course and profile", async ({ studentPage }) => {
    await studentPage.goto("/dashboard");
    await expectDashboardShell(studentPage);

    await navigateCabinetLink(studentPage, /^курс$/i);
    await expect(studentPage).toHaveURL(/\/dashboard\/course/);
    await expect(studentPage.locator("h1").first()).toBeVisible();

    await studentPage.goto("/dashboard");
    await navigateCabinetLink(studentPage, /профиль/i);
    await expect(studentPage).toHaveURL(/\/dashboard\/profile/);
  });

  test("mobile project: course reachable via drawer or link", async ({ studentPage }, testInfo) => {
    test.skip(testInfo.project.name === "desktop", "Mobile nav covered on mobile project");

    await studentPage.goto("/dashboard");
    const courseLink = studentPage.getByRole("link", { name: /^курс$/i }).first();
    await expect(courseLink).toBeVisible({ timeout: 15_000 });
    await courseLink.click();
    await expect(studentPage).toHaveURL(/\/dashboard\/course/);
  });
});
