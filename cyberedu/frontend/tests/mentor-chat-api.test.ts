import { describe, expect, it } from "vitest";
import {
  MENTOR_CHAT_UNAVAILABLE_USER_MESSAGE,
  auditMentorContextStripped,
  handleMentorChatRouteError,
  mentorChatBodySchema,
  normalizeMentorChatBodyJson,
  toSafeClientErrorMessage,
} from "@/lib/ai/mentor-chat-api";
import { AiNotConfiguredError, AiProviderError } from "@/lib/ai-config";

describe("normalizeMentorChatBodyJson", () => {
  it("accepts mode and safeContext aliases and strips forbidden keys", () => {
    const normalized = normalizeMentorChatBodyJson({
      message: "Привет",
      mode: "explain_simple",
      safe_context: {
        sourceType: "lesson",
        answerKey: "secret",
        lessonTitle: "Урок",
      },
    }) as Record<string, unknown>;

    expect(normalized.mentorModeId).toBe("explain_simple");
    const ctx = normalized.mentorContext as Record<string, unknown>;
    expect(ctx.sourceType).toBe("lesson");
    expect(ctx).not.toHaveProperty("answerKey");
  });
});

describe("mentorChatBodySchema", () => {
  it("parses canonical mentor chat body", () => {
    const parsed = mentorChatBodySchema.safeParse({
      message: "Объясни",
      mentor_mode_id: "review_mistake",
      mentor_context: { sourceType: "test_result", weakTopics: ["Фишинг"] },
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.mentorModeId).toBe("review_mistake");
      expect(parsed.data.mentorContext?.sourceType).toBe("test_result");
    }
  });
});

describe("handleMentorChatRouteError", () => {
  it("returns disabled message for AiNotConfiguredError", async () => {
    const res = handleMentorChatRouteError(new AiNotConfiguredError(), {
      userId: "u1",
      ip: "127.0.0.1",
    });
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.error).toBe(MENTOR_CHAT_UNAVAILABLE_USER_MESSAGE);
    expect(body.code).toBe("AI_NOT_CONFIGURED");
  });

  it("returns graceful fallback for AiProviderError without stack", async () => {
    const res = handleMentorChatRouteError(new AiProviderError(), {
      userId: "u1",
      ip: "127.0.0.1",
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { reply: string; meta: { providerUnavailable?: boolean } };
    expect(body.reply.length).toBeGreaterThan(20);
    expect(body.meta.providerUnavailable).toBe(true);
    expect(body.reply).not.toMatch(/^\s*at\s+/m);
  });

  it("sanitizes internal errors", async () => {
    const res = handleMentorChatRouteError(new Error("Error: boom\n    at foo.js:1"), {
      userId: "u1",
      ip: "127.0.0.1",
    });
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: string };
    expect(body.error).not.toMatch(/^\s*at\s+/m);
    expect(body.error).not.toContain("foo.js");
  });
});

describe("toSafeClientErrorMessage", () => {
  it("drops stack-like server text", () => {
    expect(toSafeClientErrorMessage("at Module.foo", "fallback")).toBe("fallback");
  });
});

describe("auditMentorContextStripped", () => {
  it("does not throw when keys stripped", () => {
    expect(() => auditMentorContextStripped("u", ["answerKey", "lessonTitle"])).not.toThrow();
  });
});
