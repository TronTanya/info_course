import { describe, expect, it } from "vitest";
import { parseLessonStructure } from "@/components/lesson/lesson-content-renderer";

describe("parseLessonStructure", () => {
  it("maps ## to h2 and ### to h3", () => {
    const segments = parseLessonStructure("## Раздел\n\n### Подраздел\n\nТекст.");
    expect(segments[0]).toEqual({ type: "h2", text: "Раздел" });
    expect(segments[1]).toEqual({ type: "h3", text: "Подраздел" });
    expect(segments[2]).toEqual({ type: "p", text: "Текст." });
  });

  it("parses ordered lists", () => {
    const segments = parseLessonStructure("1. Первый\n2. Второй");
    expect(segments[0]).toEqual({ type: "ol", items: ["Первый", "Второй"] });
  });

  it("parses fenced info callouts", () => {
    const source = ":::info\nПодсказка\nТело подсказки.\n:::";
    const segments = parseLessonStructure(source);
    expect(segments[0]?.type).toBe("info");
    if (segments[0]?.type === "info") {
      expect(segments[0].title).toBe("Подсказка");
      expect(segments[0].body).toContain("Тело");
    }
  });

  it("parses fenced example blocks", () => {
    const segments = parseLessonStructure(":::example\nКейс\nОписание.\n:::");
    expect(segments[0]).toEqual({ type: "ex", title: "Кейс", body: "Описание." });
  });

  it("parses markdown code fences", () => {
    const segments = parseLessonStructure("```bash\necho hi\n```");
    expect(segments[0]).toEqual({ type: "code", language: "bash", body: "echo hi" });
  });

  it("parses figure fence with image path and caption", () => {
    const source = [
      ":::figure",
      "Тема модуля",
      "/lessons/module-01-basics.png",
      "Подпись к иллюстрации.",
      ":::",
    ].join("\n");
    const segments = parseLessonStructure(source);
    expect(segments[0]).toEqual({
      type: "figure",
      title: "Тема модуля",
      src: "/lessons/module-01-basics.png",
      caption: "Подпись к иллюстрации.",
    });
  });

  it("parses resources fence with external links", () => {
    const source = [
      ":::resources",
      "Дополнительные материалы",
      "Видео и статьи.",
      "- [Видео (YouTube)](https://www.youtube.com/watch?v=abc) | video",
      "- [Статья](https://example.com/article) | article",
      ":::",
    ].join("\n");
    const segments = parseLessonStructure(source);
    expect(segments[0]?.type).toBe("resources");
    if (segments[0]?.type === "resources") {
      expect(segments[0].title).toBe("Дополнительные материалы");
      expect(segments[0].intro).toBe("Видео и статьи.");
      expect(segments[0].items).toHaveLength(2);
      expect(segments[0].items[0]).toMatchObject({
        title: "Видео (YouTube)",
        href: "https://www.youtube.com/watch?v=abc",
        kind: "video",
      });
    }
  });
});
