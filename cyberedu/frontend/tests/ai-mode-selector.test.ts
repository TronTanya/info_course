import { describe, expect, it } from "vitest";
import {
  AI_MODE_SELECTOR_ORDER,
  buildMentorModePrompt,
  MENTOR_MODES,
} from "@/lib/ai/mentor-ui/modes";

describe("AIModeSelector data", () => {
  it("lists all seven modes in display order", () => {
    expect(AI_MODE_SELECTOR_ORDER).toHaveLength(7);
    for (const id of AI_MODE_SELECTOR_ORDER) {
      expect(MENTOR_MODES.some((m) => m.id === id)).toBe(true);
    }
  });

  it("uses user-facing labels", () => {
    const labels = new Map(MENTOR_MODES.map((m) => [m.id, m.label]));
    expect(labels.get("check_understanding")).toBe("Проверь понимание");
    expect(labels.get("improve_reasoning")).toBe("Улучшить аргументацию");
  });

  it("builds safe starter prompts per context", () => {
    const prompt = buildMentorModePrompt("review_mistake", "test");
    expect(prompt).toMatch(/ошибк/i);
    expect(prompt).toMatch(/не называй правильные/i);
    const arg = buildMentorModePrompt("improve_reasoning", "practice");
    expect(arg).toMatch(/аргументац/i);
    expect(arg).not.toMatch(/system/i);
  });
});
