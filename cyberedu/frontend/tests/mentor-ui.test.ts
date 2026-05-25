import { describe, expect, it } from "vitest";
import {
  difficultyToSecurityLevel,
  resolveSafeResponseState,
  securityLevelLabel,
} from "@/lib/ai/mentor-ui/badges";
import { getSuggestedPrompts } from "@/lib/ai/mentor-ui/suggested-prompts";
import { buildContextChips, resolveMentorContextKind } from "@/lib/ai/mentor-ui/context";
import { buildMentorModePrompt, getMentorModesForSurface, MENTOR_MODES } from "@/lib/ai/mentor-ui/modes";
import { getMentorRefusalUi, isMentorRefusalMessage } from "@/lib/ai/mentor-ui/refusal-ui";
import { resolveMentorSurface } from "@/lib/ai/mentor-ui/surfaces";
import { buildMentorTestDebriefHint } from "@/lib/ai/mentor-ui/test-debrief";
import { formatMentorTestSummary } from "@/lib/ai/mentor-ui/test-summary";

describe("mentor-ui", () => {
  it("resolves context kind", () => {
    expect(resolveMentorContextKind({ lessonId: "l1" })).toBe("lesson");
    expect(resolveMentorContextKind({ practicalTaskId: "p1" })).toBe("practice");
    expect(
      resolveMentorContextKind({ moduleId: "m1" }, { testSummary: "Тест: 70%" }),
    ).toBe("test");
  });

  it("resolves mentor surface", () => {
    expect(resolveMentorSurface({ lessonId: "l1" })).toBe("lesson");
    expect(
      resolveMentorSurface({ moduleId: "m1", labels: { testSummary: "Тест: 80%" } }),
    ).toBe("test_result");
  });

  it("maps difficulty to security level labels", () => {
    expect(securityLevelLabel(difficultyToSecurityLevel("advanced"))).toBe("Specialist");
  });

  it("flags policy responses", () => {
    expect(
      resolveSafeResponseState({
        topic: "offensive_request",
        difficulty: "beginner",
        recommendations: [],
        refused: true,
        refusalCode: "offensive_attack",
      }),
    ).toBe("refusal");
  });

  it("returns prompts per context", () => {
    expect(getSuggestedPrompts("lesson").length).toBeGreaterThan(0);
    expect(getSuggestedPrompts("practice")[0].text).toMatch(/практическ/i);
    expect(getSuggestedPrompts("test")[0].text).toMatch(/ошибил/i);
  });

  it("builds mode prompts without system instructions", () => {
    expect(MENTOR_MODES.map((m) => m.id)).toEqual([
      "explain_simple",
      "give_example",
      "check_understanding",
      "summarize",
      "hint_only",
      "review_mistake",
      "improve_reasoning",
    ]);
    const hint = buildMentorModePrompt("hint_only", "practice");
    expect(hint).toMatch(/подсказк/i);
    expect(hint).not.toMatch(/system/i);
    const review = buildMentorModePrompt("review_mistake", "test");
    expect(review).toMatch(/ошибк/i);
    expect(review).toMatch(/не называй правильные/i);
  });

  it("filters modes by surface", () => {
    const practiceModes = getMentorModesForSurface("practice");
    expect(practiceModes.some((m) => m.id === "improve_reasoning")).toBe(true);
    expect(practiceModes.some((m) => m.id === "review_mistake")).toBe(false);
    const testModes = getMentorModesForSurface("test_result");
    expect(testModes.some((m) => m.id === "review_mistake")).toBe(true);
  });

  it("refusal ui covers exam spoiler", () => {
    const ui = getMentorRefusalUi("exam_spoiler");
    expect(ui.title).toMatch(/готовых/i);
    expect(
      isMentorRefusalMessage({
        topic: "academic_integrity",
        difficulty: "beginner",
        recommendations: [],
        refused: true,
        refusalCode: "exam_spoiler",
      }),
    ).toBe(true);
  });

  it("includes topic and test summary in context chips", () => {
    const chips = buildContextChips(
      "test",
      { moduleTitle: "М1", topic: "Фишинг", testSummary: "Тест: 80% (зачтён)" },
      "m1",
    );
    expect(chips.map((c) => c.label)).toEqual(
      expect.arrayContaining(["М1", "Фишинг", "Тест: 80% (зачтён)"]),
    );
  });

  it("formats test summary without answers", () => {
    expect(formatMentorTestSummary({ title: "Модуль 1", percent: 72, passed: false })).toMatch(/не зачтён/);
    expect(
      formatMentorTestSummary({
        title: "Модуль 1",
        percent: 90,
        passed: true,
        correctCount: 9,
        totalGraded: 10,
      }),
    ).toMatch(/верно 9\/10/);
  });

  it("builds test debrief without question text or keys", () => {
    const hint = buildMentorTestDebriefHint([
      {
        questionId: "q1",
        questionText: "Какой пароль самый стойкий? A) 123 B) correct-secret",
        topic: "Пароли",
        feedback: "Повторите раздел про длину и менеджеры паролей.",
        isCorrect: false,
        showGradingStatus: true,
      },
      {
        questionId: "q2",
        questionText: "Что такое фишинг?",
        isCorrect: true,
        showGradingStatus: true,
      },
    ]);
    expect(hint).toMatch(/Пароли/);
    expect(hint).toMatch(/Повторите раздел/);
    expect(hint).not.toMatch(/correct-secret/);
    expect(hint).not.toMatch(/самый стойкий/);
  });
});
