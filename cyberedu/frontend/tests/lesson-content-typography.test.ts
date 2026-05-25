import { describe, expect, it } from "vitest";
import {
  LESSON_READING_MAX_WIDTH,
  lessonContentArticleWideClass,
} from "@/lib/lesson-content-typography";

describe("lesson-content-typography", () => {
  it("caps reading column width for readability", () => {
    expect(LESSON_READING_MAX_WIDTH).toBe("42rem");
  });

  it("wide article layout uses full column width", () => {
    expect(lessonContentArticleWideClass).toContain("max-w-none");
    expect(lessonContentArticleWideClass).toContain("ce-lesson-content__article--wide");
  });
});
