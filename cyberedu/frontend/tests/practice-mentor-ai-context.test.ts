import { describe, expect, it } from "vitest";
import {
  buildPracticeAIMentorContextInput,
  formatPracticePublicInstructions,
  formatPracticeScenarioSummary,
} from "@/lib/practice-mentor-ai-context";
import { PRACTICE_MENTOR_FORBIDDEN_CONTEXT_KEYS } from "@/lib/practice-mentor-panel";

describe("practice-mentor-ai-context", () => {
  it("formats scenario without solution fields", () => {
    const summary = formatPracticeScenarioSummary({
      role: "Аналитик SOC",
      context: "Подозрительное письмо от «банка».",
      goal: "Оценить риск и описать действия.",
    });
    expect(summary).toMatch(/Аналитик SOC/);
    expect(summary).toMatch(/Подозрительное письмо/);
    expect(summary).not.toMatch(/answerKey|solution/i);
  });

  it("formats public instructions as numbered list", () => {
    const text = formatPracticePublicInstructions([
      { id: "i1", text: "Прочитайте сценарий." },
      { id: "i2", text: "Сформулируйте вывод." },
    ]);
    expect(text).toMatch(/1\. Прочитайте/);
    expect(text).toMatch(/2\. Сформулируйте/);
  });

  it("builds AIMentorContextInput for practice without forbidden keys", () => {
    const ctx = buildPracticeAIMentorContextInput({
      moduleId: "mod-1",
      practicalTaskId: "task-9",
      practiceTitle: "Фишинг",
      moduleTitle: "Модуль 2",
      taskDescription: "Опишите признаки угрозы.",
      scenario: { context: "Письмо с вложением.", goal: "Найти индикаторы." },
      instructions: [{ id: "a", text: "Шаг один." }],
    });
    expect(ctx.sourceType).toBe("practice");
    expect(ctx.sourceId).toBe("task-9");
    expect(ctx.practiceTitle).toBe("Фишинг");
    expect(ctx.scenarioSummary).toBeTruthy();
    expect(ctx.publicInstructions).toMatch(/Шаг один/);
    for (const key of PRACTICE_MENTOR_FORBIDDEN_CONTEXT_KEYS) {
      expect((ctx as Record<string, unknown>)[key]).toBeUndefined();
    }
  });

  it("strips leak patterns from scenario", () => {
    const summary = formatPracticeScenarioSummary({
      context: "Use answer key to solve",
      goal: "Complete lab",
    });
    expect(summary).toBeUndefined();
  });
});
