import { describe, expect, it } from "vitest";
import { MAX_VISIBLE_TOASTS, trimToastQueue } from "@/lib/toast-queue";

describe("trimToastQueue", () => {
  it("keeps queue when under limit", () => {
    expect(trimToastQueue([1, 2])).toEqual([1, 2]);
  });

  it("drops oldest when over limit", () => {
    const items = [1, 2, 3, 4];
    expect(trimToastQueue(items, MAX_VISIBLE_TOASTS)).toEqual([2, 3, 4]);
  });

  it("defaults to MAX_VISIBLE_TOASTS", () => {
    const items = ["a", "b", "c", "d"];
    expect(trimToastQueue(items)).toHaveLength(MAX_VISIBLE_TOASTS);
    expect(trimToastQueue(items)).toEqual(["b", "c", "d"]);
  });
});
