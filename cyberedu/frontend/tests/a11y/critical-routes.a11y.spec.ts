import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { loginAs, resetAuthStorage } from "../../e2e/helpers/auth";
import { gotoStable, reduceMotion } from "../helpers/hydration";

const CRITICAL_VIOLATION_IDS = ["color-contrast", "image-alt", "label", "button-name", "link-name"];

async function analyzePage(page: import("@playwright/test").Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "best-practice"])
    .analyze();

  type AxeViolation = (typeof results.violations)[number];
  const critical = results.violations.filter(
    (v: AxeViolation) => v.impact === "critical" || CRITICAL_VIOLATION_IDS.includes(v.id),
  );

  if (critical.length > 0) {
    const summary = critical
      .map((v: AxeViolation) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} node(s)`)
      .join("\n");
    expect.soft(critical, `a11y [${label}]\n${summary}`).toHaveLength(0);
  }

  return results;
}

test.describe("Accessibility — critical routes", () => {
  test.beforeEach(async ({ page }) => {
    await reduceMotion(page);
  });

  test("landing has no critical axe violations", async ({ page }) => {
    await gotoStable(page, "/");
    await analyzePage(page, "landing");
  });

  test("login has no critical axe violations", async ({ page }) => {
    await gotoStable(page, "/auth/login");
    await analyzePage(page, "login");
  });

  test("public reviews", async ({ page }) => {
    await gotoStable(page, "/reviews");
    await analyzePage(page, "reviews");
  });

  test("student dashboard shell", async ({ page, context }) => {
    await resetAuthStorage(context);
    await loginAs(page, "student");
    await gotoStable(page, "/dashboard", { expectMain: true });
    await analyzePage(page, "dashboard");
  });
});
