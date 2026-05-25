import { describe, expect, it } from "vitest";
import { safeLessonHref, safeLessonImageSrc } from "@/lib/safe-lesson-url";

describe("safeLessonHref", () => {
  it("allows relative app paths", () => {
    expect(safeLessonHref("/dashboard/course")).toBe("/dashboard/course");
    expect(safeLessonHref("/docs/guide#section")).toBe("/docs/guide#section");
  });

  it("rejects protocol-relative and unsafe schemes", () => {
    expect(safeLessonHref("//evil.example")).toBeNull();
    expect(safeLessonHref("javascript:alert(1)")).toBeNull();
    expect(safeLessonHref("data:text/html,hi")).toBeNull();
  });

  it("allows http and https only", () => {
    expect(safeLessonHref("https://example.com/path")).toBe("https://example.com/path");
    expect(safeLessonHref("http://localhost:3000")).toBe("http://localhost:3000/");
  });
});

describe("safeLessonImageSrc", () => {
  it("mirrors href rules for images", () => {
    expect(safeLessonImageSrc("/public/lesson.png")).toBe("/public/lesson.png");
    expect(safeLessonImageSrc("javascript:void(0)")).toBeNull();
  });
});
