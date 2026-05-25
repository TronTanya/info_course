import { describe, expect, it } from "vitest";
import {
  classifyPracticeClientError,
  PRACTICE_LOCKED_TEST_REASON,
  PRACTICE_SECTION_EMPTY,
  resolvePracticeClientErrorDisplay,
  resolvePracticeLockedReason,
  sanitizePracticeUserMessage,
} from "@/lib/practice-page-state";

describe("resolvePracticeLockedReason", () => {
  it("maps TEST gate to student-facing copy", () => {
    expect(resolvePracticeLockedReason("TEST", "fallback")).toBe(PRACTICE_LOCKED_TEST_REASON);
  });
});

describe("classifyPracticeClientError", () => {
  it("classifies upload errors", () => {
    expect(classifyPracticeClientError("Не удалось загрузить файл: слишком большой")).toBe("upload");
  });

  it("classifies submit errors", () => {
    expect(classifyPracticeClientError("Не удалось отправить ответ")).toBe("submit");
  });

  it("classifies access errors", () => {
    expect(classifyPracticeClientError("Сначала сдайте тест модуля")).toBe("access");
  });
});

describe("sanitizePracticeUserMessage", () => {
  it("replaces technical prisma errors with safe copy", () => {
    const msg = sanitizePracticeUserMessage(
      'Invalid `prisma.submission.create()` invocation:\nUnique constraint failed',
      "submit",
    );
    expect(msg).not.toMatch(/prisma/i);
    expect(msg).toContain("отправ");
  });

  it("strips uuid-like ids from user-visible text", () => {
    const msg = sanitizePracticeUserMessage(
      "Ошибка для задания 550e8400-e29b-41d4-a716-446655440000",
      "generic",
    );
    expect(msg).not.toMatch(/550e8400/i);
  });

  it("hides storage paths", () => {
    const msg = sanitizePracticeUserMessage(
      "ENOENT: /var/private/uploads/report.pdf",
      "upload",
    );
    expect(msg).not.toMatch(/private\/uploads/i);
  });

  it("hides stack trace lines", () => {
    const msg = sanitizePracticeUserMessage("Error\n    at handler (file.ts:12:3)", "generic");
    expect(msg).not.toMatch(/at handler/i);
  });
});

describe("resolvePracticeClientErrorDisplay", () => {
  it("maps upload failure to friendly message", () => {
    const { kind, message } = resolvePracticeClientErrorDisplay("upload failed multipart");
    expect(kind).toBe("upload");
    expect(message).toMatch(/загрузить файл/i);
  });
});

describe("PRACTICE_SECTION_EMPTY", () => {
  it("defines scenario, evidence, and instructions copy", () => {
    expect(PRACTICE_SECTION_EMPTY.scenario.title).toBe("Сценарий");
    expect(PRACTICE_SECTION_EMPTY.evidence.message).toMatch(/расследован/i);
    expect(PRACTICE_SECTION_EMPTY.instructions.message).toMatch(/Инструкции/i);
  });
});
