import { describe, expect, it } from "vitest";
import { buildLessonContentLegendItems } from "@/lib/lesson-content-legend";

const SAMPLE = `
:::intro
Вступление
Цель.
:::

:::theory
Теория
Текст.
:::

:::warning
Риск
Не делайте так.
:::

- [ ] Пункт чеклиста
`;

describe("lesson-content-legend", () => {
  it("buildLessonContentLegendItems counts theory, warning, checklist", () => {
    const items = buildLessonContentLegendItems(SAMPLE);
    expect(items.some((i) => i.key === "theory")).toBe(true);
    expect(items.some((i) => i.key === "warning")).toBe(true);
    expect(items.some((i) => i.key === "checklist")).toBe(true);
  });
});
