import { describe, expect, it } from "vitest";
import { AI_MENTOR_FORBIDDEN_CONTEXT_KEYS } from "@/lib/ai/mentor-ui/forbidden-context";
import { normalizeAIMentorMode } from "@/lib/ai/mentor-ui/mode-bridge";
import {
  isUserDraftAllowedForMode,
  sanitizeAIMentorContextInput,
  stripForbiddenFromUnknown,
} from "@/lib/ai/mentor-ui/safe-context-mapper";
import { buildServerAIMentorContext } from "@/lib/ai/mentor-ui/build-server-context";
import { AI_MENTOR_MODES } from "@/types/ai-mentor";

describe("ai-mentor view model", () => {
  it("defines seven canonical modes", () => {
    expect(AI_MENTOR_MODES).toHaveLength(7);
    expect(AI_MENTOR_MODES).toContain("improve_reasoning");
  });

  it("normalizes legacy mode ids", () => {
    expect(normalizeAIMentorMode("simpler")).toBe("explain_simple");
    expect(normalizeAIMentorMode("structure_answer")).toBe("improve_reasoning");
    expect(normalizeAIMentorMode("explain_simple")).toBe("explain_simple");
  });

  it("strips forbidden keys from client context", () => {
    const { safe, strippedKeys } = stripForbiddenFromUnknown({
      moduleTitle: "Модуль 1",
      answerKey: "secret",
      correctOptionId: "a",
      safeTopic: "Фишинг",
    });
    expect(strippedKeys).toEqual(
      expect.arrayContaining(["answerKey", "correctOptionId"]),
    );
    expect(safe).not.toHaveProperty("answerKey");
    expect(safe.moduleTitle).toBe("Модуль 1");
  });

  it("does not include userDraft on lesson surface", () => {
    const { context } = sanitizeAIMentorContextInput(
      { sourceType: "lesson", userDraft: "мой черновик", moduleTitle: "M" },
      { allowUserDraft: true },
    );
    expect(context.userDraft).toBeUndefined();
  });

  it("allows userDraft on practice only for improve_reasoning", () => {
    expect(isUserDraftAllowedForMode("improve_reasoning", "practice")).toBe(true);
    expect(isUserDraftAllowedForMode("improve_reasoning", "lesson")).toBe(false);
    expect(isUserDraftAllowedForMode("hint_only", "practice")).toBe(false);

    const { context } = sanitizeAIMentorContextInput(
      {
        sourceType: "practice",
        userDraft: "Я думаю, что инцидент начался с фишинга.",
        practiceTitle: "Лаб",
      },
      { allowUserDraft: true },
    );
    expect(context.userDraft).toContain("фишинга");
  });

  it("buildServerAIMentorContext uses DB excerpt not client solution", () => {
    const { pageContext, strippedClientKeys } = buildServerAIMentorContext(
      {
        mentorSurface: "lesson",
        moduleTitle: "М1",
        lessonTitle: "Урок",
        lessonContent: "Текст лекции про пароли.",
        clientContext: {
          safeExcerpt: "answerKey: all correct flags",
          solution: "full answer",
        },
      },
      { interestsLine: "—", specialtyLine: "—" },
    );
    expect(strippedClientKeys.length).toBeGreaterThan(0);
    expect(pageContext.lessonExcerpt).toMatch(/парол/i);
    expect(pageContext.lessonExcerpt).not.toMatch(/answerKey/i);
  });

  it("forbidden list covers academic integrity leaks", () => {
    expect(AI_MENTOR_FORBIDDEN_CONTEXT_KEYS).toEqual(
      expect.arrayContaining(["correctOptionId", "hiddenRubric", "apiKey", "userEmail"]),
    );
  });
});
