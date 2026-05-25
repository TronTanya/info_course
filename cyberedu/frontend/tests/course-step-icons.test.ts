import { describe, expect, it } from "vitest";
import { COURSE_STEP_ICON_CONFIG, ROADMAP_STEP_ICON_KIND } from "@/lib/course-step-icons";

describe("course-step-icons", () => {
  it("defines icon config for every step kind", () => {
    expect(Object.keys(COURSE_STEP_ICON_CONFIG)).toHaveLength(8);
    expect(COURSE_STEP_ICON_CONFIG.test.label).toBe("Тест");
    expect(COURSE_STEP_ICON_CONFIG.practice.accent).toBe("accent");
  });

  it("maps roadmap steps to catalog kinds", () => {
    expect(ROADMAP_STEP_ICON_KIND.lesson).toBe("lesson");
    expect(ROADMAP_STEP_ICON_KIND.practice).toBe("practice");
  });
});
