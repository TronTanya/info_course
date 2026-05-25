import { describe, expect, it } from "vitest";
import { structureMentorLine, structureMentorReply } from "@/lib/mentor-markdown-structure";

describe("structureMentorReply", () => {
  it("promotes konспект title to h2", () => {
    expect(structureMentorLine("Конспект: Основы ИБ (Модуль 1)")).toBe(
      "## Конспект: Основы ИБ (Модуль 1)",
    );
  });

  it("promotes numbered sections to h3", () => {
    expect(structureMentorLine("1. Что такое информационная безопасность?")).toBe(
      "### 1. Что такое информационная безопасность?",
    );
  });

  it("wraps analogy lines as blockquote", () => {
    expect(structureMentorLine("Аналогия: аккаунт как сейф")).toBe("> Аналогия: аккаунт как сейф");
  });

  it("converts em-dash bullets to list items", () => {
    expect(structureMentorReply("— это угроза")).toBe("- это угроза");
  });
});
