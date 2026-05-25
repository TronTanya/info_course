import { describe, expect, it } from "vitest";
import {
  LESSON_OUTLINE_ANCHORS,
  LESSON_OUTLINE_STATIC_LABELS,
  buildLessonContentHeadings,
  buildLessonOutline,
  buildLessonStaticOutline,
} from "@/lib/lesson-outline-ui";

const WITH_HEADINGS = `
:::intro
Вступление
Текст.
:::

## Первая тема
Абзац.

### Подтема
Детали.

## Вторая тема
Ещё текст.
`;

describe("lesson-outline-ui", () => {
  it("buildLessonStaticOutline lists five page sections", () => {
    const items = buildLessonStaticOutline(true);
    expect(items).toHaveLength(5);
    expect(items[0]?.label).toBe(LESSON_OUTLINE_STATIC_LABELS.goals);
    expect(items[0]?.id).toBe(LESSON_OUTLINE_ANCHORS.goals);
    expect(items.at(-1)?.label).toBe(LESSON_OUTLINE_STATIC_LABELS.completion);
  });

  it("buildLessonContentHeadings extracts h2 and h3 ids", () => {
    const headings = buildLessonContentHeadings(WITH_HEADINGS, ["intro"]);
    expect(headings.length).toBeGreaterThanOrEqual(3);
    expect(headings.some((h) => h.depth === 1)).toBe(true);
    expect(headings.some((h) => h.depth === 2)).toBe(true);
    expect(headings.every((h) => h.id.startsWith("ls-"))).toBe(true);
  });

  it("buildLessonOutline merges static shell with headings when enough h2/h3", () => {
    const outline = buildLessonOutline({
      content: WITH_HEADINGS,
      bodySkipTypes: ["intro"],
      hasCheckpointQuestions: false,
    });
    expect(outline[0]?.label).toBe("Цели");
    expect(outline.some((i) => i.label === "Материал" && i.kind === "static")).toBe(true);
    expect(outline.some((i) => i.kind === "content")).toBe(true);
    expect(outline.at(-1)?.label).toBe("Завершение");
    const checkpoint = outline.find((i) => i.label === "Самопроверка");
    expect(checkpoint?.id).toBe(LESSON_OUTLINE_ANCHORS.checkpointEmpty);
  });

  it("buildLessonOutline falls back to static-only without headings", () => {
    const outline = buildLessonOutline({
      content: ":::theory\nТолько теория\nТекст.\n:::",
      bodySkipTypes: [],
      hasCheckpointQuestions: true,
    });
    expect(outline).toHaveLength(5);
    expect(outline.every((i) => i.kind === "static")).toBe(true);
  });
});
