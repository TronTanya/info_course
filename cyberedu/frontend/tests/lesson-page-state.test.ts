import { describe, expect, it } from "vitest";
import {
  classifyLessonClientError,
  isLessonContentEmpty,
  LESSON_SECTION_EMPTY,
  resolveLessonClientErrorDisplay,
  sanitizeLessonUserMessage,
} from "@/lib/lesson-page-state";

describe("isLessonContentEmpty", () => {
  it("treats blank and fence-only as empty", () => {
    expect(isLessonContentEmpty("")).toBe(true);
    expect(isLessonContentEmpty("   ")).toBe(true);
    expect(isLessonContentEmpty(":::info\n\n:::")).toBe(true);
    expect(isLessonContentEmpty("## Заголовок\n\nТекст.")).toBe(false);
  });
});

describe("classifyLessonClientError", () => {
  it("classifies progress save errors", () => {
    expect(classifyLessonClientError("Не удалось сохранить прогресс")).toBe("progress_save");
  });

  it("classifies access errors", () => {
    expect(classifyLessonClientError("Требуется вход.")).toBe("access");
    expect(classifyLessonClientError("Сначала завершите предыдущий модуль")).toBe("access");
  });

  it("falls back to generic", () => {
    expect(classifyLessonClientError("Неизвестное действие AI.")).toBe("generic");
  });
});

describe("sanitizeLessonUserMessage", () => {
  it("replaces technical prisma errors with safe copy", () => {
    const msg = sanitizeLessonUserMessage(
      'Invalid `prisma.progress.update()` invocation:\nUnique constraint failed on the fields: (`userId`,`moduleId`)',
      "progress_save",
    );
    expect(msg).not.toMatch(/prisma/i);
    expect(msg).toContain("прогресс");
  });

  it("strips uuid-like ids from user-visible text", () => {
    const msg = sanitizeLessonUserMessage(
      "Ошибка для модуля 550e8400-e29b-41d4-a716-446655440000",
      "generic",
    );
    expect(msg).not.toMatch(/550e8400/i);
  });

  it("hides stack trace lines", () => {
    const msg = sanitizeLessonUserMessage("Error\n    at Object.handler (file.ts:12:3)", "generic");
    expect(msg).not.toMatch(/at Object/i);
  });
});

describe("resolveLessonClientErrorDisplay", () => {
  it("maps progress save to friendly message", () => {
    const { kind, message } = resolveLessonClientErrorDisplay("Не удалось сохранить прогресс");
    expect(kind).toBe("progress_save");
    expect(message).toContain("прогресс");
  });
});

describe("LESSON_SECTION_EMPTY", () => {
  it("defines copy for objectives, terms, checkpoint", () => {
    expect(LESSON_SECTION_EMPTY.objectives.message).toContain("Цели");
    expect(LESSON_SECTION_EMPTY.key_terms.message).toContain("термин");
    expect(LESSON_SECTION_EMPTY.checkpoint.message).toContain("Самопроверка");
  });
});
