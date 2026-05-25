import { describe, expect, it } from "vitest";
import { isImmersiveDashboardPath, isLessonDashboardPath } from "@/lib/immersive-dashboard-path";

describe("immersive-dashboard-path", () => {
  it("matches lesson without trailing slash", () => {
    expect(isImmersiveDashboardPath("/dashboard/course/m1/lesson")).toBe(true);
    expect(isLessonDashboardPath("/dashboard/course/m1/lesson")).toBe(true);
  });

  it("matches lesson with trailing slash", () => {
    expect(isImmersiveDashboardPath("/dashboard/course/m1/lesson/")).toBe(true);
  });

  it("matches test and practice", () => {
    expect(isImmersiveDashboardPath("/dashboard/course/m1/test")).toBe(true);
    expect(isImmersiveDashboardPath("/dashboard/course/m1/practice")).toBe(true);
  });

  it("does not match course hub", () => {
    expect(isImmersiveDashboardPath("/dashboard/course/m1")).toBe(false);
    expect(isLessonDashboardPath("/dashboard/course")).toBe(false);
  });
});
