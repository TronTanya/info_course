import { describe, expect, it } from "vitest";
import {
  difficultyToSecurityLevel,
  resolveSafeResponseState,
  securityLevelLabel,
} from "@/lib/ai/mentor-ui/badges";
import { getSuggestedPrompts } from "@/lib/ai/mentor-ui/suggested-prompts";
import { buildContextChips, resolveMentorContextKind } from "@/lib/ai/mentor-ui/context";
import { buildMentorModePrompt, MENTOR_MODES } from "@/lib/ai/mentor-ui/modes";
import { formatMentorTestSummary } from "@/lib/ai/mentor-ui/test-summary";

describe("mentor-ui", () => {
  it("resolves context kind", () => {
    expect(resolveMentorContextKind({ lessonId: "l1" })).toBe("lesson");
    expect(resolveMentorContextKind({ practicalTaskId: "p1" })).toBe("practice");
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
  });

  it("builds mode prompts without system instructions", () => {
    expect(MENTOR_MODES).toHaveLength(5);
    const prompt = buildMentorModePrompt("hint", "practice");
    expect(prompt).toMatch(/подсказк/i);
    expect(prompt).not.toMatch(/system/i);
  });

  it("includes topic and test summary in context chips", () => {
    const chips = buildContextChips(
      "module",
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
});
