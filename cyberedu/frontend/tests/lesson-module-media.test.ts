import { describe, expect, it } from "vitest";
import { getLessonMarkdown } from "../prisma/lesson-content";
import { parseLessonStructure } from "@/components/lesson/lesson-content-renderer";

describe("lesson module media in seed content", () => {
  it("includes figure and resources fences for each module", () => {
    const md = getLessonMarkdown(0, "Основы ИБ");
    expect(md).toContain(":::figure");
    expect(md).not.toContain(":::meme");
    expect(md).toContain(":::resources");
    expect(md).toContain("/lessons/module-01-basics.png");

    const segments = parseLessonStructure(md);
    expect(segments.some((s) => s.type === "figure")).toBe(true);
    expect(segments.some((s) => s.type === "resources")).toBe(true);
    const resources = segments.find((s) => s.type === "resources");
    if (resources?.type === "resources") {
      expect(resources.items.length).toBeGreaterThanOrEqual(2);
      expect(resources.items.every((i) => i.href.startsWith("https://"))).toBe(true);
    }
  });
});
