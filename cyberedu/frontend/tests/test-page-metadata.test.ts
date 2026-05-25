import { describe, expect, it } from "vitest";
import {
  buildTestMetaDescription,
  buildTestPageMetadataFromInput,
  sanitizeTestMetaLabel,
} from "@/lib/test-page-metadata";

describe("test-page-metadata", () => {
  it("sanitizeTestMetaLabel normalizes whitespace", () => {
    expect(sanitizeTestMetaLabel("  Фишинг\nв почте  ", 40)).toBe("Фишинг в почте");
  });

  it("buildTestMetaDescription uses module name only", () => {
    expect(buildTestMetaDescription("Социальная инженерия")).toBe(
      "Проверка знаний по модулю Социальная инженерия.",
    );
  });

  it("buildTestPageMetadataFromInput uses test title when details may be exposed", () => {
    const meta = buildTestPageMetadataFromInput({
      moduleActive: true,
      canExposeTestDetails: true,
      testTitle: "Контрольный тест",
      moduleTitle: "Фишинг",
    });
    expect(meta.title).toEqual({ absolute: "Контрольный тест — CyberEdu" });
    expect(meta.description).toBe("Проверка знаний по модулю Фишинг.");
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });

  it("buildTestPageMetadataFromInput hides names without canExposeTestDetails", () => {
    const meta = buildTestPageMetadataFromInput({
      moduleActive: true,
      testTitle: "Секретный тест",
      moduleTitle: "Закрытый модуль",
    });
    expect(meta.title).toEqual({ absolute: "Тест модуля — CyberEdu" });
    expect(meta.description).not.toContain("Секретный");
    expect(meta.description).not.toContain("Закрытый");
  });

  it("buildTestPageMetadataFromInput hides inactive module titles", () => {
    const meta = buildTestPageMetadataFromInput({
      moduleActive: false,
      canExposeTestDetails: true,
      testTitle: "Тест",
      moduleTitle: "Модуль",
    });
    expect(meta.title).toEqual({ absolute: "Тест модуля — CyberEdu" });
    expect(String(meta.description)).not.toContain("Модуль");
  });
});
