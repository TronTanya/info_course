import { describe, expect, it } from "vitest";
import {
  buildLessonMentorSafeContext,
  isLessonMentorContextSafe,
  LESSON_MENTOR_DEFAULT_MODE_IDS,
  LESSON_MENTOR_INTRO,
  LESSON_MENTOR_LOCKED_MESSAGE,
  LESSON_MENTOR_QUICK_ACTIONS,
  LESSON_MENTOR_SUGGESTED_PROMPTS,
  lessonMentorContextLabels,
} from "@/lib/lesson-mentor-panel";
import { buildLessonAIMentorContextInput } from "@/lib/lesson-mentor-ai-context";

describe("buildLessonMentorSafeContext", () => {
  it("includes only ids and public titles", () => {
    const ctx = buildLessonMentorSafeContext({
      moduleId: "mod-1",
      lessonId: "les-1",
      title: "Фишинг",
      moduleTitle: "Модуль 2",
    });
    expect(ctx).toEqual({
      moduleId: "mod-1",
      lessonId: "les-1",
      title: "Фишинг",
      topic: "Модуль 2",
    });
    expect(Object.keys(ctx)).not.toContain("content");
    expect(Object.keys(ctx)).not.toContain("checkpoints");
    expect(isLessonMentorContextSafe(ctx)).toBe(true);
    expect(isLessonMentorContextSafe({ ...ctx, correctAnswerId: "x" })).toBe(false);
  });
});

describe("LESSON_MENTOR_INTRO", () => {
  it("uses stage-10 description", () => {
    expect(LESSON_MENTOR_INTRO).toBe(
      "Помогает разобраться в теме урока без раскрытия готовых ответов.",
    );
  });
});

describe("lessonMentorContextLabels", () => {
  it("maps safe context to mentor labels without PII fields", () => {
    const labels = lessonMentorContextLabels(
      buildLessonMentorSafeContext({
        moduleId: "m",
        lessonId: "l",
        title: "Урок",
        moduleTitle: "Тема",
      }),
    );
    expect(labels).toEqual({
      lessonTitle: "Урок",
      moduleTitle: "Тема",
      topic: "Тема",
    });
    expect(labels).not.toHaveProperty("email");
    expect(labels).not.toHaveProperty("testSummary");
  });
});

describe("LESSON_MENTOR_QUICK_ACTIONS", () => {
  it("lists four lesson chat modes with boot prompts", () => {
    expect(LESSON_MENTOR_QUICK_ACTIONS.map((a) => a.label)).toEqual([
      "Объясни проще",
      "Приведи пример",
      "Проверь понимание",
      "Сделай конспект",
    ]);
    expect(LESSON_MENTOR_QUICK_ACTIONS.map((a) => a.mentorModeId)).toEqual(
      LESSON_MENTOR_DEFAULT_MODE_IDS,
    );
  });
});

describe("LESSON_MENTOR_SUGGESTED_PROMPTS", () => {
  it("matches stage-7 quick prompt copy", () => {
    expect(LESSON_MENTOR_SUGGESTED_PROMPTS.map((p) => p.text)).toEqual([
      "Объясни этот урок простыми словами",
      "Приведи пример из жизни",
      "Задай мне 3 вопроса для самопроверки",
      "Сделай краткий конспект",
    ]);
  });
});

describe("LESSON_MENTOR_LOCKED_MESSAGE", () => {
  it("tells student to open the lesson", () => {
    expect(LESSON_MENTOR_LOCKED_MESSAGE).toBe("Откройте урок, чтобы получить помощь.");
  });
});

describe("buildLessonAIMentorContextInput", () => {
  it("builds lesson sourceType without test answers or forbidden keys", () => {
    const ctx = buildLessonAIMentorContextInput({
      moduleId: "mod-1",
      lessonId: "les-1",
      lessonTitle: "Урок 1",
      moduleTitle: "Модуль A",
      safeTopic: "Модуль A",
      description: "Кратко о фишинге",
      objectives: [{ text: "Понять признаки" }],
      keyTerms: [{ term: "Фишинг", definition: "Обман" }],
    });
    expect(ctx.sourceType).toBe("lesson");
    expect(ctx.sourceId).toBe("les-1");
    expect(ctx.lessonTitle).toBe("Урок 1");
    expect(ctx.moduleTitle).toBe("Модуль A");
    expect(ctx.safeTopic).toBe("Модуль A");
    expect(ctx.safeExcerpt).toBeTruthy();
    expect(ctx).not.toHaveProperty("testAnswers");
    expect(ctx).not.toHaveProperty("correctAnswer");
    expect(ctx).not.toHaveProperty("userDraft");
  });
});
