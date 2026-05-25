import { describe, expect, it } from "vitest";
import {
  buildTaskInstructionsSections,
  isTaskInstructionsReady,
  splitPracticeInstructionText,
  TASK_INSTRUCTIONS_EMPTY_MESSAGE,
} from "@/lib/practice-task-instructions-ui";

describe("splitPracticeInstructionText", () => {
  it("splits multiline instructions into bullets", () => {
    const lines = splitPracticeInstructionText("Первый пункт.\nВторой пункт.");
    expect(lines).toHaveLength(2);
  });

  it("splits long single paragraph into sentences", () => {
    const text =
      "Опишите минимум 3 подозрительных признака письма. Для каждого признака объясните, почему он может указывать на фишинг. В конце напишите, какие безопасные действия должен выполнить сотрудник.";
    const lines = splitPracticeInstructionText(text);
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });
});

describe("buildTaskInstructionsSections", () => {
  it("maps instructions and safe rubric without solution fields", () => {
    const sections = buildTaskInstructionsSections(
      [
        {
          id: "i1",
          text: "Опишите минимум 3 подозрительных признака. Объясните риск для каждого.",
        },
      ],
      [
        { id: "r1", title: "Формат: Текстовый отчёт." },
        { id: "r2", title: "Текст отчёта: не короче 100 символов." },
        { id: "r3", title: "Учебные демо-данные: без реальных атак и без доступа к продакшен-системам." },
      ],
    );

    expect(sections.whatToDo.length).toBeGreaterThan(0);
    expect(sections.answerFormat[0]).toContain("Формат");
    expect(sections.minimumRequirements[0]).toContain("не короче");
    expect(sections.constraints.some((c) => c.includes("демо-данные"))).toBe(true);
    expect(sections.whatToDo.join(" ")).not.toMatch(/answerKey|solution/i);
  });

  it("empty when no instruction and no rubric", () => {
    const sections = buildTaskInstructionsSections([], []);
    expect(isTaskInstructionsReady(sections)).toBe(false);
  });
});

describe("TASK_INSTRUCTIONS_EMPTY_MESSAGE", () => {
  it("uses placeholder copy", () => {
    expect(TASK_INSTRUCTIONS_EMPTY_MESSAGE).toContain("будут добавлены");
  });
});
