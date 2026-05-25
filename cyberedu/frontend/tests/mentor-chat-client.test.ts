import { describe, expect, it } from "vitest";
import {
  MENTOR_GUARDRAIL_NOTE,
  MENTOR_MAX_PROMPT_LENGTH,
  buildMentorChatBody,
  mentorChatErrorMessage,
  resolveMentorChatErrorKind,
} from "@/lib/ai/mentor-ui/chat-client";

describe("mentor-chat-client", () => {
  it("exposes guardrail note and max prompt length", () => {
    expect(MENTOR_GUARDRAIL_NOTE).toMatch(/не выполняет задания/i);
    expect(MENTOR_MAX_PROMPT_LENGTH).toBe(8000);
  });

  it("maps 429 to rate_limit with mentor-specific copy", () => {
    expect(resolveMentorChatErrorKind(429)).toBe("rate_limit");
    expect(resolveMentorChatErrorKind(undefined, "RATE_LIMITED")).toBe("rate_limit");
    expect(mentorChatErrorMessage("rate_limit")).toBe(
      "Слишком много запросов к AI-наставнику. Подождите немного и попробуйте снова.",
    );
  });

  it("strips stack-trace-like server messages", () => {
    const trace = "Error: boom\n    at Handler (/app/node_modules/foo.js:12:3)";
    expect(mentorChatErrorMessage("server", trace)).toMatch(/временно недоступен/i);
    expect(mentorChatErrorMessage("server", trace)).not.toMatch(/node_modules/);
  });

  it("truncates message in request body", () => {
    const long = "x".repeat(MENTOR_MAX_PROMPT_LENGTH + 100);
    const body = buildMentorChatBody({ message: long }, {});
    expect((body.message as string).length).toBe(MENTOR_MAX_PROMPT_LENGTH);
  });
});
