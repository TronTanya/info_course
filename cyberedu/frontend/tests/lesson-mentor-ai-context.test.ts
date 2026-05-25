import { describe, expect, it } from "vitest";
import { sanitizeAIMentorContextInput } from "@/lib/ai/mentor-ui/safe-context-mapper";
import { buildLessonAIMentorContextInput } from "@/lib/lesson-mentor-ai-context";

describe("buildLessonAIMentorContextInput", () => {
  it("sanitizes to AIMentorContext without leaking test data", () => {
    const raw = buildLessonAIMentorContextInput({
      moduleId: "m",
      lessonId: "l",
      lessonTitle: "Лекция",
      moduleTitle: "М2",
      description: "Описание",
    });
    const { context, strippedKeys } = sanitizeAIMentorContextInput({
      ...raw,
      testAnswers: ["a"],
      correctAnswer: "secret",
    } as Record<string, unknown>);
    expect(context.sourceType).toBe("lesson");
    expect(context.lessonTitle).toBe("Лекция");
    expect(context.moduleTitle).toBe("М2");
    expect(strippedKeys.length).toBeGreaterThan(0);
    expect(context).not.toHaveProperty("testAnswers");
  });
});
