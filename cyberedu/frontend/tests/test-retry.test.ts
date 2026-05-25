import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  TEST_ATTEMPTS_EXHAUSTED_MESSAGE,
  assertTestAttemptAllowed,
  getTestAttemptLimitFromEnv,
  resolveTestCanRetry,
} from "@/lib/test-retry";

describe("test-retry", () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it("resolveTestCanRetry allows unlimited when no limit", () => {
    expect(resolveTestCanRetry({ attemptsUsed: 99, maxAttempts: null })).toBe(true);
  });

  it("resolveTestCanRetry blocks when attempts exhausted", () => {
    expect(resolveTestCanRetry({ attemptsUsed: 3, maxAttempts: 3 })).toBe(false);
    expect(resolveTestCanRetry({ attemptsUsed: 2, maxAttempts: 3 })).toBe(true);
  });

  it("assertTestAttemptAllowed matches server guard", () => {
    expect(assertTestAttemptAllowed(2, 2)).toEqual({ ok: false, error: TEST_ATTEMPTS_EXHAUSTED_MESSAGE });
    expect(assertTestAttemptAllowed(1, 2)).toEqual({ ok: true });
  });

  describe("getTestAttemptLimitFromEnv", () => {
    beforeEach(() => {
      delete process.env.TEST_MAX_ATTEMPTS_PER_TEST;
    });

    it("reads positive integer from env", () => {
      process.env.TEST_MAX_ATTEMPTS_PER_TEST = "5";
      expect(getTestAttemptLimitFromEnv()).toBe(5);
    });

    it("returns null for invalid env", () => {
      process.env.TEST_MAX_ATTEMPTS_PER_TEST = "0";
      expect(getTestAttemptLimitFromEnv()).toBeNull();
    });
  });
});
