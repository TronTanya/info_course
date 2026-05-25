import { describe, expect, it } from "vitest";
import {
  LESSON_CALLOUT_HEADINGS,
  resolveLessonCalloutType,
} from "@/lib/lesson-callout-types";

describe("resolveLessonCalloutType", () => {
  it("maps MDX aliases to canonical types", () => {
    expect(resolveLessonCalloutType("warning")).toBe("warning");
    expect(resolveLessonCalloutType("warn")).toBe("warning");
    expect(resolveLessonCalloutType("risk")).toBe("danger");
    expect(resolveLessonCalloutType("unknown")).toBe("info");
  });
});

describe("LESSON_CALLOUT_HEADINGS", () => {
  it("matches stage-8 Russian labels", () => {
    expect(LESSON_CALLOUT_HEADINGS.warning).toBe("Предупреждение");
    expect(LESSON_CALLOUT_HEADINGS.danger).toBe("Риск");
    expect(LESSON_CALLOUT_HEADINGS.tip).toBe("Совет");
  });
});
