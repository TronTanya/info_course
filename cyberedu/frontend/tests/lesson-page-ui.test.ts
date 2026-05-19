import { describe, expect, it } from "vitest";
import { extractKeyIdeas, extractLessonGoal, extractSelfCheckItems } from "@/lib/lesson-page-ui";

const SAMPLE = `
:::intro
Введение
Краткая цель урока.
:::

Основной абзац материала.

:::remember
Запомни
- Первая идея
- Вторая идея
:::

- [ ] Могу объяснить термин

:::warning
Ошибка
Не путайте понятия.
:::

:::how
Применение
Опишите шаги защиты своими словами.
:::
`;

describe("lesson-page-ui", () => {
  it("extractLessonGoal prefers intro", () => {
    expect(extractLessonGoal(SAMPLE)).toContain("цель");
  });

  it("extractKeyIdeas collects remember bullets", () => {
    const ideas = extractKeyIdeas(SAMPLE);
    expect(ideas.some((i) => i.includes("Первая"))).toBe(true);
  });

  it("extractSelfCheckItems includes checklist and warning", () => {
    const items = extractSelfCheckItems(SAMPLE);
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items.some((i) => i.question.includes("Ошибка") || i.question.includes("Применение"))).toBe(true);
  });
});
