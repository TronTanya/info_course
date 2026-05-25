import { describe, expect, it } from "vitest";
import { sanitizeAIMentorContextInput } from "@/lib/ai/mentor-ui/safe-context-mapper";
import { buildTestResultAIMentorContextInput } from "@/lib/test-mentor-ai-context";
import {
  TEST_MENTOR_DEFAULT_MODE_IDS,
  TEST_MENTOR_FORBIDDEN_CONTEXT_KEYS,
  TEST_MENTOR_QUICK_ACTIONS,
  TEST_MENTOR_SUGGESTED_PROMPTS,
  buildTestMentorSafeContext,
  testMentorContextLabels,
} from "@/lib/test-mentor-panel";
import { getMentorModesForSurface } from "@/lib/ai/mentor-ui/modes";

describe("TEST_MENTOR_QUICK_ACTIONS", () => {
  it("lists four post-test modes with stage-9 labels", () => {
    expect(TEST_MENTOR_QUICK_ACTIONS.map((a) => a.label)).toEqual([
      "Разобрать ошибку",
      "Повторить слабую тему",
      "Составить план повторения",
      "Проверить понимание",
    ]);
    expect(TEST_MENTOR_QUICK_ACTIONS.map((a) => a.mentorModeId)).toEqual(TEST_MENTOR_DEFAULT_MODE_IDS);
  });
});

describe("TEST_MENTOR_SUGGESTED_PROMPTS", () => {
  it("matches stage-9 quick prompt copy", () => {
    expect(TEST_MENTOR_SUGGESTED_PROMPTS.map((p) => p.text)).toEqual([
      "Объясни тему, в которой я ошибился",
      "Составь план повторения на 10 минут",
      "Задай мне вопросы по слабой теме",
    ]);
  });
});

describe("buildTestResultAIMentorContextInput", () => {
  it("builds test_result context without answer keys", () => {
    const ctx = buildTestResultAIMentorContextInput({
      moduleId: "mod-1",
      attemptId: "att-1",
      testTitle: "Модульный тест",
      moduleTitle: "М2",
      weakTopics: [{ title: "Фишинг" }],
      strongTopics: [{ title: "Пароли" }],
      recommendations: [{ title: "Повторить материал", description: "Вернитесь к лекции." }],
    });
    expect(ctx.sourceType).toBe("test_result");
    expect(ctx.testTitle).toBe("Модульный тест");
    expect(ctx.weakTopics).toEqual(["Фишинг"]);
    expect(ctx.strongTopics).toEqual(["Пароли"]);
    expect(ctx.safeExcerpt).toContain("Повторить материал");
    expect(ctx).not.toHaveProperty("correctAnswer");
    expect(ctx).not.toHaveProperty("selectedAnswers");
  });

  it("strips forbidden keys on sanitize", () => {
    const raw = buildTestResultAIMentorContextInput({
      moduleId: "m",
      attemptId: "a",
      testTitle: "T",
      moduleTitle: "M",
    });
    const { context, strippedKeys } = sanitizeAIMentorContextInput({
      ...raw,
      answerKey: "secret",
      selectedAnswers: ["x"],
    } as Record<string, unknown>);
    expect(context.sourceType).toBe("test_result");
    expect(strippedKeys).toContain("answerKey");
    expect(strippedKeys).toContain("selectedAnswers");
  });
});

describe("testMentorContextLabels", () => {
  it("includes safe test summary without correct options", () => {
    const labels = testMentorContextLabels(
      buildTestMentorSafeContext({
        moduleId: "m",
        testTitle: "Тест",
        moduleTitle: "Модуль",
        percent: 72,
        passed: false,
      }),
    );
    expect(labels.testSummary).toContain("72%");
    expect(labels.testSummary).not.toMatch(/correctOption|answerKey/i);
  });
});

describe("TEST_MENTOR_FORBIDDEN_CONTEXT_KEYS", () => {
  it("blocks answer leakage fields", () => {
    expect(TEST_MENTOR_FORBIDDEN_CONTEXT_KEYS).toContain("answerKey");
    expect(TEST_MENTOR_FORBIDDEN_CONTEXT_KEYS).toContain("selectedAnswers");
  });
});

describe("getMentorModesForSurface(test_result)", () => {
  it("includes summarize for study plan mode", () => {
    const ids = getMentorModesForSurface("test_result").map((m) => m.id);
    expect(ids).toContain("summarize");
    expect(ids).toContain("review_mistake");
  });
});
