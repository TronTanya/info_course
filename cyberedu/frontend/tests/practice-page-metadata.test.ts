import { describe, expect, it } from "vitest";
import {
  buildPracticeMetaDescription,
  buildPracticePageMetadataFromInput,
  resolvePracticeMetaTitle,
  sanitizePracticeMetaLabel,
} from "@/lib/practice-page-metadata";

describe("practice-page-metadata", () => {
  it("sanitizePracticeMetaLabel normalizes whitespace", () => {
    expect(sanitizePracticeMetaLabel("  Лаб\nпо фишингу  ", 40)).toBe("Лаб по фишингу");
  });

  it("buildPracticeMetaDescription uses module name only", () => {
    expect(buildPracticeMetaDescription("Социальная инженерия")).toBe(
      "Практическая лаборатория по модулю Социальная инженерия.",
    );
  });

  it("resolvePracticeMetaTitle uses task title for a single task", () => {
    expect(resolvePracticeMetaTitle([{ title: "Разбор письма" }])).toBe("Разбор письма");
  });

  it("resolvePracticeMetaTitle uses generic label for multiple tasks", () => {
    expect(
      resolvePracticeMetaTitle([{ title: "Задача 1" }, { title: "Задача 2" }]),
    ).toBe("Кибер-лаборатория");
  });

  it("buildPracticePageMetadataFromInput uses practice title when details may be exposed", () => {
    const meta = buildPracticePageMetadataFromInput({
      moduleActive: true,
      canExposePracticeDetails: true,
      practiceTitle: "Разбор журнала",
      moduleTitle: "Фишинг",
    });
    expect(meta.title).toEqual({ absolute: "Разбор журнала — CyberEdu" });
    expect(meta.description).toBe("Практическая лаборатория по модулю Фишинг.");
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });

  it("buildPracticePageMetadataFromInput hides names without canExposePracticeDetails", () => {
    const meta = buildPracticePageMetadataFromInput({
      moduleActive: true,
      practiceTitle: "Секретная лаборатория",
      moduleTitle: "Закрытый модуль",
    });
    expect(meta.title).toEqual({ absolute: "Кибер-лаборатория — CyberEdu" });
    expect(meta.description).not.toContain("Секретная");
    expect(meta.description).not.toContain("Закрытый");
  });

  it("buildPracticePageMetadataFromInput hides inactive module titles", () => {
    const meta = buildPracticePageMetadataFromInput({
      moduleActive: false,
      canExposePracticeDetails: true,
      practiceTitle: "Лаб",
      moduleTitle: "Модуль",
    });
    expect(meta.title).toEqual({ absolute: "Кибер-лаборатория — CyberEdu" });
    expect(String(meta.description)).not.toContain("Модуль");
  });
});
