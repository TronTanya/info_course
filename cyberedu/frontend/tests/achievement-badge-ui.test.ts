import { describe, expect, it } from "vitest";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievements";
import {
  groupAchievementsByCategory,
  scaleAchievementRank,
  sortAchievementsCatalogOrder,
} from "@/lib/achievement-badge-ui";

describe("achievement-badge-ui", () => {
  it("groups catalog into progress and activity", () => {
    const rows = ACHIEVEMENT_CATALOG.map((d) => ({
      ...d,
      unlocked: false,
      unlockedAt: null,
    }));
    const groups = groupAchievementsByCategory(rows);
    expect(groups).toHaveLength(2);
    expect(groups[0]?.id).toBe("progress");
    expect(groups[1]?.id).toBe("activity");
    expect(groups[0]!.rows.length).toBeGreaterThan(0);
    expect(groups[1]!.rows.length).toBeGreaterThan(0);
  });

  it("scaleAchievementRank shows 5/5 when unlocked", () => {
    const r = scaleAchievementRank(null, true);
    expect(r.label).toBe("5/5 ранг");
    expect(r.current).toBe(5);
  });

  it("sortAchievementsCatalogOrder preserves catalog order", () => {
    const rows = ACHIEVEMENT_CATALOG.slice(0, 3).map((d) => ({
      ...d,
      unlocked: true,
      unlockedAt: null,
    }));
    const reversed = [...rows].reverse();
    const sorted = sortAchievementsCatalogOrder(reversed);
    expect(sorted.map((r) => r.kind)).toEqual(rows.map((r) => r.kind));
  });
});
