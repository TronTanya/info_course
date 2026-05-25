import { describe, expect, it } from "vitest";
import { resolveLandingMetrics } from "@/lib/landing-marketing";

describe("landing-marketing", () => {
  it("uses static metrics when database is empty", () => {
    const { live, items } = resolveLandingMetrics({
      totalUsers: 0,
      activeModules: 0,
      practiceTasks: 0,
      certificatesIssued: 0,
    });
    expect(live).toBe(false);
    expect(items.length).toBe(5);
    expect(items[0]?.value).toBe("12+");
  });

  it("uses live metrics when modules exist", () => {
    const { live, items } = resolveLandingMetrics({
      totalUsers: 42,
      activeModules: 6,
      practiceTasks: 12,
      certificatesIssued: 3,
    });
    expect(live).toBe(true);
    expect(items.some((i) => i.key === "students")).toBe(true);
    expect(items.find((i) => i.key === "modules")?.value).toBe("6");
  });
});
