import { describe, expect, it } from "vitest";
import {
  buildLessonSectionNav,
  countLessonBlockTypes,
  lessonSectionId,
} from "@/lib/lesson-section-nav";

const SAMPLE = `
:::intro
Введение
Цель урока в одном абзаце.
:::

:::theory
Основы
Текст теории.
:::

:::warning
Ошибка
Не делайте так.
:::

## Раздел два
`;

describe("lesson-section-nav", () => {
  it("lessonSectionId is stable for index and label", () => {
    expect(lessonSectionId(0, "Основы")).toMatch(/^ls-0-/);
    expect(lessonSectionId(0, "Основы")).toBe(lessonSectionId(0, "Основы"));
  });

  it("buildLessonSectionNav lists navigable blocks", () => {
    const nav = buildLessonSectionNav(SAMPLE, ["intro"]);
    expect(nav.length).toBeGreaterThanOrEqual(2);
    expect(nav.some((n) => n.kind === "theory")).toBe(true);
    expect(nav.some((n) => n.kind === "warning")).toBe(true);
    expect(nav.some((n) => n.kind === "intro")).toBe(false);
  });

  it("countLessonBlockTypes aggregates block kinds", () => {
    const counts = countLessonBlockTypes(SAMPLE);
    expect(counts.theory).toBe(1);
    expect(counts.warning).toBe(1);
    expect(counts.intro).toBe(1);
  });
});
