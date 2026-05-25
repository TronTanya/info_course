import { describe, expect, it } from "vitest";
import { isCourseNotStarted, isCourseWithoutModules } from "@/lib/course-page-state";
import type { CourseProgressModuleRow } from "@/lib/progress";

function row(overrides: Partial<CourseProgressModuleRow> = {}): CourseProgressModuleRow {
  return {
    module: {
      id: "m1",
      title: "M",
      description: null,
      orderNumber: 1,
      courseId: "c1",
      isActive: true,
    },
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: true,
      practiceRequired: true,
    },
    contentCounts: { lessons: 1, tests: 1, practices: 1 },
    progress: null,
    unlocked: true,
    progressPercent: 0,
    score: 0,
    moduleCompleted: false,
    ...overrides,
  } as CourseProgressModuleRow;
}

describe("course-page-state", () => {
  it("isCourseWithoutModules", () => {
    expect(isCourseWithoutModules([])).toBe(true);
    expect(isCourseWithoutModules([row()])).toBe(false);
  });

  it("isCourseNotStarted when no activity", () => {
    expect(isCourseNotStarted([row(), row({ module: { ...row().module, id: "m2", orderNumber: 2 } })])).toBe(true);
  });

  it("isCourseNotStarted false after lesson progress", () => {
    expect(
      isCourseNotStarted([
        row({
          progress: {
            lessonCompleted: true,
            videoCompleted: false,
            testCompleted: false,
            practiceCompleted: false,
          } as CourseProgressModuleRow["progress"],
        }),
      ]),
    ).toBe(false);
  });

  it("isCourseNotStarted false when empty modules", () => {
    expect(isCourseNotStarted([])).toBe(false);
  });
});
