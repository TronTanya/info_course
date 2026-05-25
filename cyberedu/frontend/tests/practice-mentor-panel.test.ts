import { describe, expect, it } from "vitest";
import {
  buildPracticeMentorChatBoot,
  buildPracticeMentorPrompt,
  buildPracticeMentorSafeContext,
  isPracticeMentorContextSafe,
  PRACTICE_MENTOR_FORBIDDEN_CONTEXT_KEYS,
  PRACTICE_MENTOR_GUARDRAIL,
  PRACTICE_MENTOR_QUICK_ACTIONS,
  sanitizePracticeArgumentExcerpt,
} from "@/lib/practice-mentor-panel";

describe("PRACTICE_MENTOR_QUICK_ACTIONS", () => {
  it("exposes five student-facing quick actions", () => {
    expect(PRACTICE_MENTOR_QUICK_ACTIONS).toHaveLength(5);
    expect(PRACTICE_MENTOR_QUICK_ACTIONS.map((a) => a.label)).toEqual([
      "Дай подсказку",
      "Объясни задание проще",
      "На что обратить внимание?",
      "Помоги оформить вывод",
      "Проверь мою аргументацию",
    ]);
  });
});

describe("buildPracticeMentorPrompt", () => {
  it("never asks for a ready-made solution", () => {
    for (const action of PRACTICE_MENTOR_QUICK_ACTIONS) {
      const prompt = buildPracticeMentorPrompt(action.id);
      expect(prompt).toMatch(/без готового|не давай готовое|не пиши готовый/i);
      expect(prompt).not.toMatch(/answerKey|gradingRubric|hiddenRubric/i);
    }
  });

  it("embeds sanitized argument excerpt only for check_argumentation", () => {
    const withDraft = buildPracticeMentorPrompt("check_argumentation", {
      argumentExcerpt: "Сначала проверю домен, затем ссылки и срочность формулировок.",
    });
    expect(withDraft).toContain("---");
    expect(withDraft).toContain("домен");

    const leaked = buildPracticeMentorPrompt("check_argumentation", {
      argumentExcerpt: "answer key is admin-secret",
    });
    expect(leaked).not.toContain("admin-secret");
    expect(leaked).toMatch(/опишу ход мысли/i);
  });
});

describe("sanitizePracticeArgumentExcerpt", () => {
  it("drops short, forbidden, and leak-pattern excerpts", () => {
    expect(sanitizePracticeArgumentExcerpt("коротко")).toBeUndefined();
    expect(sanitizePracticeArgumentExcerpt("solution text here for grader")).toBeUndefined();
    expect(
      sanitizePracticeArgumentExcerpt(
        "Достаточно длинный черновик без секретов: сравниваю заголовки и поведение ссылок.",
      ),
    ).toBeTruthy();
  });

  it("truncates very long drafts", () => {
    const long = "а".repeat(2500);
    const out = sanitizePracticeArgumentExcerpt(long);
    expect(out).toBeDefined();
    expect(out!.length).toBeLessThanOrEqual(2001);
    expect(out!.endsWith("…")).toBe(true);
  });
});

describe("buildPracticeMentorSafeContext", () => {
  it("only exposes safe metadata fields", () => {
    const ctx = buildPracticeMentorSafeContext({
      moduleId: "mod-1",
      practicalTaskId: "task-1",
      taskTitle: "Фишинг",
      moduleTitle: "Модуль 3",
      taskType: "TEXT_ANSWER",
    });
    expect(isPracticeMentorContextSafe(ctx)).toBe(true);
    expect(Object.keys(ctx).sort()).toEqual(
      [
        "moduleId",
        "moduleTitle",
        "practicalTaskId",
        "publicInstructionsPreview",
        "scenarioSummary",
        "taskTitle",
        "taskTypeLabel",
      ].sort(),
    );
    expect(PRACTICE_MENTOR_FORBIDDEN_CONTEXT_KEYS).not.toContain("moduleId");
  });
});

describe("buildPracticeMentorChatBoot", () => {
  it("maps hint action to mentor hint mode", () => {
    const boot = buildPracticeMentorChatBoot("hint_no_answer");
    expect(boot.modeId).toBe("hint_only");
    expect(boot.prompt).toMatch(/без готового/i);
  });

  it("maps argumentation check to check_understanding mode", () => {
    const boot = buildPracticeMentorChatBoot("check_argumentation");
    expect(boot.modeId).toBe("check_understanding");
  });
});

describe("PRACTICE_MENTOR_GUARDRAIL", () => {
  it("warns that AI does not complete the lab", () => {
    expect(PRACTICE_MENTOR_GUARDRAIL).toContain("не выполняет лабораторию");
  });
});
