import { describe, expect, it } from "vitest";
import { pickModuleIdForStudentNav } from "@/lib/nav-module-context";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";

function row(id: string, unlocked = true, completed = false): CourseProgressModuleRow {
  return {
    module: { id, title: id, orderNumber: 1, description: null },
    unlocked,
    moduleCompleted: completed,
    progressPercent: 0,
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: true,
      practiceRequired: true,
      totalSteps: 3,
    },
    progress: null,
    score: 0,
  } as CourseProgressModuleRow;
}

describe("pickModuleIdForStudentNav", () => {
  it("prefers stats.currentModuleId", () => {
    const stats = { currentModuleId: "m-current" } as ProfileCourseStats;
    expect(pickModuleIdForStudentNav(stats, [row("m-other")])).toBe("m-current");
  });

  it("falls back to first unlocked incomplete module", () => {
    expect(
      pickModuleIdForStudentNav(null, [row("m1", true, true), row("m2", true, false)]),
    ).toBe("m2");
  });
});
