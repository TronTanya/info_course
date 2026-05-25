import { describe, expect, it } from "vitest";
import {
  buildTestIntroRules,
  isTestAttemptsExhausted,
  resolveTestIntroState,
  testIntroBreadcrumbs,
} from "@/lib/test-intro";

describe("test-intro", () => {
  it("testIntroBreadcrumbs follows Course → Module → Test", () => {
    const items = testIntroBreadcrumbs("m1", "Фишинг", "Контрольный тест");
    expect(items).toHaveLength(3);
    expect(items[0]?.label).toBe("Курс");
    expect(items[1]?.href).toBe("/dashboard/course/m1");
    expect(items[2]?.label).toBe("Контрольный тест");
  });

  it("buildTestIntroRules includes time limit and no-edit-after-submit", () => {
    const rules = buildTestIntroRules({
      timeLimitMinutes: 30,
      estimatedMinutes: 20,
      allowEditAfterSubmit: false,
    });
    expect(rules.some((r) => r.includes("30"))).toBe(true);
    expect(rules.some((r) => /нельзя/i.test(r) && /после отправки/i.test(r))).toBe(true);
    expect(rules.some((r) => /AI-наставник/i.test(r))).toBe(true);
  });

  it("resolveTestIntroState prioritizes locked and attempts", () => {
    expect(
      resolveTestIntroState({ locked: true, attemptCount: 0, lastPassed: false }),
    ).toBe("locked");
    expect(
      resolveTestIntroState({ attemptCount: 3, maxAttempts: 3, lastPassed: false }),
    ).toBe("attempts_exhausted");
    expect(
      resolveTestIntroState({ attemptCount: 1, maxAttempts: 3, lastPassed: true }),
    ).toBe("already_passed");
  });

  it("isTestAttemptsExhausted false when unlimited", () => {
    expect(isTestAttemptsExhausted(10, null)).toBe(false);
  });
});
