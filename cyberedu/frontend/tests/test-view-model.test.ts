import { describe, expect, it } from "vitest";
import type { ClientTestQuestion } from "@/lib/test-grading";
import {
  assertCleanTestViewPayload,
  buildTestResultViewModel,
  buildTestViewModel,
  collectForbiddenKeys,
} from "@/lib/test-view-mapper";
import { TEST_VIEW_MODEL_FORBIDDEN_KEYS } from "@/types/test-view-model";

const sampleQuestions: ClientTestQuestion[] = [
  {
    id: "q1",
    questionText: "Как проверить подлинность письма?",
    questionType: "SINGLE_CHOICE",
    points: 2,
    orderNumber: 1,
    answers: [
      { id: "a1", answerText: "Проверить домен отправителя" },
      { id: "a2", answerText: "Открыть все вложения" },
    ],
  },
  {
    id: "q2",
    questionText: "Что такое MFA?",
    questionType: "TRUE_FALSE",
    points: 1,
    orderNumber: 2,
    answers: [
      { id: "b1", answerText: "Верно" },
      { id: "b2", answerText: "Неверно" },
    ],
  },
];

describe("buildTestViewModel", () => {
  it("maps questions without forbidden answer fields", () => {
    const vm = buildTestViewModel({
      testId: "t1",
      title: "Контрольный тест",
      moduleId: "m1",
      moduleTitle: "Фишинг",
      moduleOrderNumber: 2,
      minScore: 7,
      questions: sampleQuestions,
      phase: "lobby",
    });

    expect(vm.title).toBe("Контрольный тест");
    expect(vm.questionCount).toBe(2);
    expect(vm.passingScore).toBe(7);
    expect(vm.status).toBe("not_started");
    expect(vm.canStart).toBe(true);
    expect(vm.questions[0]?.options).toHaveLength(2);
    expect(vm.questions[0]?.options[0]).toEqual({
      id: "a1",
      text: "Проверить домен отправителя",
    });

    assertCleanTestViewPayload(vm);
  });

  it("marks locked module without leaking lesson content in title", () => {
    const vm = buildTestViewModel({
      testId: "t1",
      title: "Секретный тест",
      moduleId: "m1",
      moduleTitle: "Модуль",
      moduleOrderNumber: 1,
      minScore: 5,
      questions: sampleQuestions,
      locked: true,
      lockedReason: "Сначала завершите предыдущий модуль.",
    });

    expect(vm.status).toBe("locked");
    expect(vm.canStart).toBe(false);
    expect(vm.lockedReason).toContain("предыдущий");
    assertCleanTestViewPayload(vm);
  });

  it("reflects in_progress and passed states", () => {
    const active = buildTestViewModel({
      testId: "t1",
      title: "Тест",
      moduleId: "m1",
      moduleTitle: "М1",
      moduleOrderNumber: 1,
      minScore: 1,
      questions: sampleQuestions,
      phase: "active",
    });
    expect(active.status).toBe("in_progress");
    expect(active.canSubmit).toBe(true);

    const passed = buildTestViewModel({
      testId: "t1",
      title: "Тест",
      moduleId: "m1",
      moduleTitle: "М1",
      moduleOrderNumber: 1,
      minScore: 1,
      questions: sampleQuestions,
      phase: "result",
      lastAttempt: { passed: true },
      practiceUnlocked: true,
    });
    expect(passed.status).toBe("passed");
    expect(passed.nextPractice?.type).toBe("practice");
  });
});

describe("buildTestResultViewModel", () => {
  it("builds result without correct option ids and filters unsafe explanations", () => {
    const result = buildTestResultViewModel({
      attemptId: "att-1",
      score: 6,
      maxScore: 10,
      percentage: 60,
      passed: false,
      correctCount: 1,
      totalCount: 2,
      moduleId: "m1",
      review: [
        {
          questionId: "q1",
          questionText: "Как проверить подлинность письма?",
          explanation: "Правильный ответ — вариант A",
          isCorrect: false,
        },
        {
          questionId: "q2",
          questionText: "Что такое MFA?",
          explanation: "MFA снижает риск компрометации учётной записи.",
          isCorrect: true,
        },
      ],
    });

    expect(result.passed).toBe(false);
    expect(result.correctCount).toBe(1);
    expect(result.weakTopics).toHaveLength(1);
    expect(result.weakTopics[0]?.reason).toBeUndefined();
    expect(result.strongTopics).toHaveLength(1);
    expect(result.recommendations.some((r) => r.title === "Повторить материал")).toBe(true);
    expect(result.recommendations.some((r) => r.title === "Вернуться к курсу")).toBe(true);

    assertCleanTestViewPayload(result);
  });
});

describe("TEST_VIEW_MODEL_FORBIDDEN_KEYS", () => {
  it("detects forbidden keys in nested payloads", () => {
    const bad = collectForbiddenKeys({
      questions: [{ id: "q1", correctOptionId: "a1" }],
    });
    expect(bad.has("correctOptionId")).toBe(true);
    expect(TEST_VIEW_MODEL_FORBIDDEN_KEYS).toContain("isCorrect");
  });
});
