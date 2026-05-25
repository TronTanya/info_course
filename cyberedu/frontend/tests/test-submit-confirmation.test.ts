import { describe, expect, it } from "vitest";
import {
  buildTestSubmitSummary,
  formatUnansweredList,
  TEST_REQUIRES_ALL_ANSWERS,
} from "@/lib/test-submit-confirmation";

describe("test-submit-confirmation", () => {
  it("requires all answers when project flag is true", () => {
    expect(TEST_REQUIRES_ALL_ANSWERS).toBe(true);
    const s = buildTestSubmitSummary(10, 8, [3, 7]);
    expect(s.unanswered).toBe(2);
    expect(s.canSubmit).toBe(false);
    expect(s.blockReason).toBeTruthy();
  });

  it("allows submit when all answered", () => {
    const s = buildTestSubmitSummary(5, 5, []);
    expect(s.allAnswered).toBe(true);
    expect(s.canSubmit).toBe(true);
    expect(s.blockReason).toBeNull();
  });

  it("formatUnansweredList truncates long lists", () => {
    const list = formatUnansweredList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 12);
    expect(list).toContain("ещё 1");
  });
});
