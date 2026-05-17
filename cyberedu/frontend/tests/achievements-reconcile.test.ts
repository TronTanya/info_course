import { describe, expect, it } from "vitest";
import { achievementNoticesFromKinds } from "@/lib/achievements";

describe("achievementNoticesFromKinds", () => {
  it("maps known kinds to catalog titles", () => {
    const notices = achievementNoticesFromKinds(["FIRST_MODULE_COMPLETE"]);
    expect(notices).toHaveLength(1);
    expect(notices[0]?.title).toBe("Первый шаг");
    expect(notices[0]?.description).toContain("модуль");
  });
});
