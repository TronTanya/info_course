import { describe, expect, it } from "vitest";
import {
  buildLessonMetaDescription,
  buildLessonPageMetadata,
  sanitizeLessonMetaDescription,
} from "@/lib/lesson-page-metadata";

describe("lesson-page-metadata", () => {
  it("sanitizeLessonMetaDescription strips markup and truncates", () => {
    const long = "А".repeat(200);
    expect(sanitizeLessonMetaDescription(`:::intro\n${long}`).length).toBeLessThanOrEqual(160);
    expect(sanitizeLessonMetaDescription("  hello   world  ")).toBe("hello world");
  });

  it("buildLessonMetaDescription uses intro only", () => {
    const desc = buildLessonMetaDescription(`
:::intro
Введение
Краткая цель урока для meta.
:::

:::theory
Секрет
Не должно попасть в description.
:::
`);
    expect(desc).toContain("цель");
    expect(desc).not.toContain("Секрет");
  });

  it("buildLessonPageMetadata uses lesson title when details may be exposed", () => {
    const meta = buildLessonPageMetadata({
      moduleActive: true,
      canExposeLessonDetails: true,
      lessonTitle: "Фишинг",
      lessonContent: ":::intro\nЦель\n:::",
    });
    expect(meta.title).toEqual({ absolute: "Фишинг — CyberEdu" });
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });

  it("buildLessonPageMetadata hides lesson names without canExposeLessonDetails", () => {
    const locked = buildLessonPageMetadata({
      moduleActive: true,
      lessonTitle: "Закрытый урок",
      lessonContent: "секретный текст",
    });
    expect(locked.title).toEqual({ absolute: "Лекция — CyberEdu" });
    expect(locked.description).not.toContain("Закрытый");
    expect(locked.description).not.toContain("секретный");
  });

  it("buildLessonPageMetadata hides inactive module and lesson names", () => {
    const meta = buildLessonPageMetadata({
      moduleActive: false,
      canExposeLessonDetails: true,
      lessonTitle: "Скрытый модуль",
      lessonContent: "секретный текст",
    });
    expect(meta.title).toEqual({ absolute: "Лекция — CyberEdu" });
    expect(meta.description).not.toContain("Скрытый");
    expect(meta.description).not.toContain("секретный");
  });
});
