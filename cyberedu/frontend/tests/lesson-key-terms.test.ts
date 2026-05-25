import { describe, expect, it } from "vitest";
import {
  KEY_TERMS_DISPLAY_MAX,
  KEY_TERMS_EMPTY_MESSAGE,
  lessonContentSuggestsPhishingTopic,
  resolveLessonKeyTerms,
} from "@/lib/lesson-key-terms";
import { extractLessonKeyTerms } from "@/lib/lesson-view-mapper";

const WITH_DEFINITION = `
:::definition
Фишинг
Обман с целью получить данные.
:::

:::definition
Домен
Имя сайта в адресе.
:::

:::definition
HTTPS
Шифрованное соединение.
:::
`;

describe("resolveLessonKeyTerms", () => {
  it("uses only extracted terms capped at six", () => {
    const extracted = extractLessonKeyTerms(WITH_DEFINITION);
    const resolved = resolveLessonKeyTerms(extracted);
    expect(resolved.some((t) => t.term === "Фишинг")).toBe(true);
    expect(resolved.length).toBeLessThanOrEqual(KEY_TERMS_DISPLAY_MAX);
  });

  it("returns empty when no extracted terms", () => {
    expect(resolveLessonKeyTerms([], "Тема: фишинг в почте.", "Фишинг")).toEqual([]);
  });

  it("does not invent phishing fallbacks", () => {
    const resolved = resolveLessonKeyTerms([], "Тема: фишинг в почте.", "Фишинг");
    expect(resolved).toEqual([]);
  });

  it("dedupes by term name", () => {
    const resolved = resolveLessonKeyTerms([
      { term: "Фишинг", definition: "A" },
      { term: "фишинг", definition: "B" },
    ]);
    expect(resolved).toHaveLength(1);
  });
});

describe("KEY_TERMS_EMPTY_MESSAGE", () => {
  it("matches stage-6 copy", () => {
    expect(KEY_TERMS_EMPTY_MESSAGE).toBe("Ключевые термины будут добавлены позже.");
  });
});

describe("lessonContentSuggestsPhishingTopic", () => {
  it("detects keywords", () => {
    expect(lessonContentSuggestsPhishingTopic("социальная инженерия")).toBe(true);
    expect(lessonContentSuggestsPhishingTopic("архитектура CPU")).toBe(false);
  });
});
