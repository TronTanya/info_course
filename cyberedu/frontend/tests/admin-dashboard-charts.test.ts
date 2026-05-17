import { describe, expect, it } from "vitest";

/** Mirrors bucket logic in lib/admin-dashboard-charts.ts */
function bucketPercent(pct: number): string {
  const defs = [
    { key: "0", min: 0, max: 0 },
    { key: "1-25", min: 1, max: 25 },
    { key: "26-50", min: 26, max: 50 },
    { key: "51-75", min: 51, max: 75 },
    { key: "76-99", min: 76, max: 99 },
    { key: "100", min: 100, max: 100 },
  ];
  for (const b of defs) {
    if (pct >= b.min && pct <= b.max) return b.key;
  }
  return "0";
}

describe("admin dashboard progress buckets", () => {
  it("maps edge percents to expected buckets", () => {
    expect(bucketPercent(0)).toBe("0");
    expect(bucketPercent(1)).toBe("1-25");
    expect(bucketPercent(25)).toBe("1-25");
    expect(bucketPercent(26)).toBe("26-50");
    expect(bucketPercent(100)).toBe("100");
  });
});
