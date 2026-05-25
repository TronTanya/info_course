import { describe, expect, it } from "vitest";
import { TEST_ATTEMPTS_EXHAUSTED_MESSAGE } from "@/lib/test-retry";
import { sanitizeTestUserMessage, testGateLockedReason } from "@/lib/test-page-state";

describe("test-page-state", () => {
  it("sanitizes prisma and uuid from messages", () => {
    const msg = sanitizeTestUserMessage(
      "Invalid `prisma.test.findMany()` invocation: cuid1234567890123456789012",
      "load",
    );
    expect(msg).not.toMatch(/prisma/i);
    expect(msg).not.toMatch(/cuid/i);
  });

  it("keeps user-facing lesson gate message", () => {
    expect(testGateLockedReason("LESSON", "Сначала изучите лекцию")).toMatch(/лекцию/i);
  });

  it("uses default locked copy for module lock", () => {
    expect(testGateLockedReason("MODULE_LOCKED", "internal")).toBe(
      "Завершите уроки модуля, чтобы открыть тест.",
    );
  });

  it("exhausted message for students", () => {
    expect(TEST_ATTEMPTS_EXHAUSTED_MESSAGE).toMatch(/преподавател/i);
    expect(TEST_ATTEMPTS_EXHAUSTED_MESSAGE).not.toMatch(/prisma/i);
  });
});
