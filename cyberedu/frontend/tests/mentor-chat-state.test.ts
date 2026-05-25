import { describe, expect, it } from "vitest";
import {
  getMentorDisabledCopy,
  isUnsafeMentorErrorMessage,
  mentorChatErrorMessage,
  resolveMentorChatErrorKind,
  resolveMentorPanelPhase,
} from "@/lib/ai/mentor-ui/chat-state";
import { MENTOR_EMPTY_HEADLINE } from "@/lib/ai/mentor-ui/constants";
import { resolveMentorChatFailureMessage } from "@/lib/ai/mentor-ui/chat-client";

describe("mentor-chat-state (ETAP 16)", () => {
  it("resolveMentorPanelPhase orders disabled and loading", () => {
    expect(
      resolveMentorPanelPhase({
        chatEnabled: false,
        disabledReason: "content_locked",
        loading: true,
        error: null,
        messageCount: 0,
      }),
    ).toBe("disabled");
    expect(
      resolveMentorPanelPhase({
        chatEnabled: true,
        loading: true,
        error: null,
        messageCount: 2,
      }),
    ).toBe("loading");
    expect(
      resolveMentorPanelPhase({
        chatEnabled: true,
        loading: false,
        error: "x",
        messageCount: 1,
      }),
    ).toBe("error");
    expect(
      resolveMentorPanelPhase({
        chatEnabled: true,
        loading: false,
        error: null,
        messageCount: 0,
      }),
    ).toBe("empty");
  });

  it("maps API codes to error kinds", () => {
    expect(resolveMentorChatErrorKind(429, "RATE_LIMITED")).toBe("rate_limit");
    expect(resolveMentorChatErrorKind(401)).toBe("unauthorized");
    expect(resolveMentorChatErrorKind(503, "AI_NOT_CONFIGURED")).toBe("config");
    expect(resolveMentorChatErrorKind(0)).toBe("network");
    expect(resolveMentorChatErrorKind(500, "AI_PROVIDER_ERROR")).toBe("provider");
  });

  it("does not expose stack traces or env in error messages", () => {
    const stack = "Error: boom\n    at foo (node_modules/bar)";
    expect(isUnsafeMentorErrorMessage(stack)).toBe(true);
    expect(mentorChatErrorMessage("server", stack)).toMatch(/временно недоступен/i);
    expect(mentorChatErrorMessage("config", "OPENAI_API_KEY missing")).toMatch(/недоступен/i);
    expect(mentorChatErrorMessage("config")).not.toMatch(/OPENAI/i);
  });

  it("resolveMentorChatFailureMessage sanitizes provider errors", () => {
    const { kind, message } = resolveMentorChatFailureMessage({
      ok: false,
      status: 502,
      error: "AiProviderError: connection reset",
      code: "AI_PROVIDER_ERROR",
    });
    expect(kind).toBe("provider");
    expect(message).not.toMatch(/AiProviderError/i);
  });

  it("disabled copy has no env variable names", () => {
    const copy = getMentorDisabledCopy("no_api_key");
    expect(copy.description).not.toMatch(/OPENAI|AI_API_KEY|process\.env/i);
  });

  it("empty headline matches ETAP 16", () => {
    expect(MENTOR_EMPTY_HEADLINE).toBe("Выберите режим или задайте вопрос.");
  });
});
