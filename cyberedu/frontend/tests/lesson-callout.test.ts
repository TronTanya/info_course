import { describe, expect, it } from "vitest";
import { LESSON_CALLOUT_HEADINGS } from "@/lib/lesson-callout-types";
import { lessonSegmentCalloutVariant } from "@/lib/lesson-callout-variant";
import { parseLessonStructure } from "@/components/lesson/lesson-content-renderer";

describe("LESSON_CALLOUT_HEADINGS", () => {
  it("defines Russian headings for all variants", () => {
    expect(LESSON_CALLOUT_HEADINGS.info).toBe("Важно");
    expect(LESSON_CALLOUT_HEADINGS.example).toBe("Пример");
    expect(LESSON_CALLOUT_HEADINGS.warning).toBe("Предупреждение");
    expect(LESSON_CALLOUT_HEADINGS.danger).toBe("Риск");
    expect(LESSON_CALLOUT_HEADINGS.checklist).toBe("Чеклист");
    expect(LESSON_CALLOUT_HEADINGS.tip).toBe("Совет");
  });
});

describe("lessonSegmentCalloutVariant", () => {
  it("maps lesson segments to callout variants", () => {
    expect(lessonSegmentCalloutVariant({ type: "info", title: "T", body: "b" })).toBe("info");
    expect(lessonSegmentCalloutVariant({ type: "ex", title: "T", body: "b" })).toBe("example");
    expect(lessonSegmentCalloutVariant({ type: "warning", title: "T", body: "b" })).toBe("warning");
    expect(lessonSegmentCalloutVariant({ type: "danger", title: "T", body: "b" })).toBe("danger");
    expect(
      lessonSegmentCalloutVariant({
        type: "checklist",
        items: [{ text: "a", checked: false }],
      }),
    ).toBe("checklist");
    expect(lessonSegmentCalloutVariant({ type: "remember", title: "T", body: "b" })).toBe("tip");
    expect(lessonSegmentCalloutVariant({ type: "h2", text: "x" })).toBeNull();
  });
});

describe(":::tip fence", () => {
  it("parses tip blocks", () => {
    const segments = parseLessonStructure(":::tip\nБыстрый совет\nТекст.\n:::");
    expect(segments[0]).toEqual({ type: "tip", title: "Быстрый совет", body: "Текст." });
  });
});
