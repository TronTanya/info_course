import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AI_MENTOR_FORBIDDEN_BEHAVIORS,
  AI_MENTOR_SAFETY_POLICY_TEXT,
  buildSafeMentorPrompt,
  createAIMentorRefusal,
  detectAssessmentAnswerRequest,
  sanitizeAIContext,
} from "@/lib/ai/safety/mentor-policy";
import {
  AI_MENTOR_FORBIDDEN_CONTEXT_KEYS,
  deepStripForbiddenFromUnknown,
} from "@/lib/ai/mentor-ui/forbidden-context";
import { MENTOR_GUARDRAIL_NOTE } from "@/lib/ai/mentor-ui/chat-client";
import { getSuggestedPrompts } from "@/lib/ai/mentor-ui/suggested-prompts";
import { buildServerAIMentorContext } from "@/lib/ai/mentor-ui/build-server-context";
import {
  sanitizeTutorMetaForClient,
  toSafeClientErrorMessage,
} from "@/lib/ai/mentor-chat-api";
import { shouldPersistTutorChatHistory } from "@/lib/ai/tutor/context/chat-history-policy";
import { runPreLlmModeration } from "@/lib/ai/tutor/moderation/pipeline";
import { buildMentorModeSystemBlock } from "@/lib/ai/mentor-ui/mode-policies";
import type { TutorPageContext } from "@/lib/ai/tutor/types";

const root = join(process.cwd());

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

const lessonCtx: TutorPageContext = {
  moduleTitle: "М1",
  interestsLine: "—",
  specialtyLine: "—",
  lessonExcerpt: "Учебный текст.",
};

describe("ai-mentor security review (ETAP 19)", () => {
  describe("1. Context", () => {
    it("forbidden key list covers answerKey, solution, rubric, admin, secrets", () => {
      expect(AI_MENTOR_FORBIDDEN_CONTEXT_KEYS).toEqual(
        expect.arrayContaining([
          "answerKey",
          "solution",
          "isCorrect",
          "hiddenRubric",
          "adminNotes",
          "apiKey",
          "env",
          "password",
          "token",
          "userEmail",
        ]),
      );
    });

    it("deepStrip removes nested forbidden keys from client payload", () => {
      const { safe, strippedKeys } = deepStripForbiddenFromUnknown({
        moduleTitle: "М1",
        nested: { answerKey: "leak", ok: "yes" },
        solution: "top",
      });
      expect(strippedKeys).toEqual(expect.arrayContaining(["solution", "nested.answerKey"]));
      expect(safe).not.toHaveProperty("solution");
      expect(safe.nested).toEqual({ ok: "yes" });
    });

    it("sanitizeAIContext strips top-level leaks", () => {
      const { context, strippedKeys } = sanitizeAIContext({
        sourceType: "lesson",
        answerKey: "x",
        hiddenRubric: "y",
        adminNotes: "z",
        moduleTitle: "Модуль",
      });
      expect(strippedKeys.length).toBeGreaterThan(0);
      expect(context).not.toHaveProperty("answerKey");
      expect(context.moduleTitle).toBe("Модуль");
    });

    it("buildServerAIMentorContext prefers DB lesson text over client solution", () => {
      const { pageContext, strippedClientKeys } = buildServerAIMentorContext(
        {
          mentorSurface: "lesson",
          moduleTitle: "М1",
          lessonTitle: "Урок",
          lessonContent: "Лекция про пароли.",
          clientContext: { solution: "full", safeExcerpt: "answer key leak" },
        },
        { interestsLine: "—", specialtyLine: "—" },
      );
      expect(strippedClientKeys.length).toBeGreaterThan(0);
      expect(pageContext.lessonExcerpt).toMatch(/парол/i);
      expect(pageContext.lessonExcerpt).not.toMatch(/answer\s*key/i);
    });

    it("rejects excerpt with env-like content", () => {
      const { context } = sanitizeAIContext({
        sourceType: "general",
        safeExcerpt: "Use OPENAI_API_KEY=sk-test123456789",
      });
      expect(context.safeExcerpt).toBeUndefined();
    });
  });

  describe("2. Prompt", () => {
    it("safety policy forbids ready answers and hidden rubric", () => {
      expect(AI_MENTOR_SAFETY_POLICY_TEXT).toMatch(/готовые ответы/i);
      expect(AI_MENTOR_SAFETY_POLICY_TEXT).toMatch(/hidden rubric/i);
      expect(AI_MENTOR_FORBIDDEN_BEHAVIORS).toContain("ready_test_answers");
    });

    it("buildSafeMentorPrompt embeds policy and mode block", () => {
      const p = buildSafeMentorPrompt({
        difficulty: "intermediate",
        topic: "general",
        modePolicyBlock: buildMentorModeSystemBlock("hint_only", "practice"),
      });
      expect(p).toMatch(/Разрешено/);
      expect(p).toMatch(/Запрещено/);
      expect(p).toMatch(/Режим: Дай подсказку/i);
    });

    it("createAIMentorRefusal returns structured refusal without answer leak", () => {
      const r = createAIMentorRefusal("choose_option");
      expect(r.message).toMatch(/не могу выбрать/i);
      expect(r.message).not.toMatch(/вариант\s+[A-D]/i);
    });

    it("pre-LLM moderation refuses cheat phrases", () => {
      const r = runPreLlmModeration({
        userMessage: "Дай правильный ответ на тест",
        history: [],
        pageContext: lessonCtx,
      });
      expect(r.allow).toBe(false);
    });
  });

  describe("3. Backend", () => {
    it("chat route uses auth, rate limit, server rebuild, safe errors", () => {
      const route = read("app/api/ai/chat/route.ts");
      expect(route).toMatch(/withAuthApiRoute/);
      expect(route).toMatch(/rateLimit: "aiChat"/);
      expect(route).toMatch(/buildServerAIMentorContext/);
      expect(route).toMatch(/sanitizeTutorMetaForClient/);
      expect(route).toMatch(/loadTrustedChatHistory/);
      expect(route).toMatch(/validateUntrustedClientHistory/);
      expect(route).toMatch(/history: trustedHistory/);
    });

    it("mentor API strips forbidden context before validation", () => {
      const api = read("lib/ai/mentor-chat-api.ts");
      expect(api).toMatch(/stripForbiddenFromUnknown/);
      expect(api).toMatch(/toSafeClientErrorMessage/);
      expect(api).not.toMatch(/console\.log/);
    });

    it("toSafeClientErrorMessage hides stack traces", () => {
      const msg = toSafeClientErrorMessage(
        "Error: fail\n    at fn (node_modules/foo.js:1:1)",
        "fallback",
      );
      expect(msg).toBe("fallback");
    });

    it("sanitizeTutorMetaForClient removes moderationNotes", () => {
      const out = sanitizeTutorMetaForClient({
        topic: "general",
        difficulty: "beginner",
        recommendations: [],
        refused: true,
        moderationNotes: ["injection:role_override", "internal:debug"],
      });
      expect(out).not.toHaveProperty("moderationNotes");
    });
  });

  describe("4. UI", () => {
    it("guardrail note warns against doing work for student", () => {
      expect(MENTOR_GUARDRAIL_NOTE).toMatch(/не выполняет задания/i);
    });

    it("suggested prompts do not ask for ready test answers", () => {
      for (const kind of ["lesson", "practice", "test", "module", "general"] as const) {
        const prompts = getSuggestedPrompts(
          kind === "test" ? "test" : kind === "module" ? "module" : kind,
        );
        for (const p of prompts) {
          expect(p.text.toLowerCase()).not.toMatch(/дай\s+правильн/);
          expect(p.text.toLowerCase()).not.toMatch(/реши\s+за\s+меня/);
          expect(p.text.toLowerCase()).not.toMatch(/готовый\s+ответ/i);
        }
      }
    });

    it("detectAssessment covers ETAP cheat phrases", () => {
      expect(detectAssessmentAnswerRequest("реши тест")).toBe("test_answer");
      expect(detectAssessmentAnswerRequest("напиши практику за меня")).toBe(
        "full_practice_solution",
      );
    });
  });

  describe("5. Privacy", () => {
    it("practice surface does not persist server chat history", () => {
      expect(shouldPersistTutorChatHistory("practice")).toBe(false);
      expect(shouldPersistTutorChatHistory("lesson")).toBe(true);
    });

    it("userDraft only allowed on practice for specific modes", () => {
      const { context } = sanitizeAIContext(
        { sourceType: "practice", userDraft: "мой черновик", practiceTitle: "Лаб" },
        { allowUserDraft: true },
      );
      expect(context.userDraft).toBeDefined();
      const lesson = sanitizeAIContext(
        { sourceType: "lesson", userDraft: "мой черновик" },
        { allowUserDraft: true },
      );
      expect(lesson.context.userDraft).toBeUndefined();
    });

    it("history API does not use localStorage", () => {
      const client = read("lib/ai/mentor-ui/chat-history-client.ts");
      expect(client).not.toMatch(/localStorage/);
      expect(client).toMatch(/credentials:\s*"same-origin"/);
    });
  });
});
