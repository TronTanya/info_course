import { beforeEach, describe, expect, it, vi } from "vitest";
import { enforceAiMentorApiRateLimit } from "@/lib/security/ai-rate-limit";
import {
  AI_MENTOR_RATE_LIMIT_MESSAGE,
  resolveApiRateLimitMessage,
} from "@/lib/security/rate-limit-messages";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { resetRateLimitServiceForTests } from "@/lib/security/rate-limit-service";

vi.mock("@/lib/security/rate-limit", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/security/rate-limit")>();
  return {
    ...actual,
    enforceRateLimit: vi.fn(),
  };
});

describe("ai-rate-limit", () => {
  beforeEach(() => {
    resetRateLimitServiceForTests();
    vi.mocked(enforceRateLimit).mockReset();
  });

  it("exposes mentor-specific user message without internal limits", () => {
    expect(AI_MENTOR_RATE_LIMIT_MESSAGE).toBe(
      "Слишком много запросов к AI-наставнику. Подождите немного и попробуйте снова.",
    );
    expect(AI_MENTOR_RATE_LIMIT_MESSAGE).not.toMatch(/redis|60|час/i);
  });

  it("resolveApiRateLimitMessage hides Redis for AI unavailable", () => {
    expect(resolveApiRateLimitMessage("aiChat", "unavailable")).not.toMatch(/redis/i);
    expect(resolveApiRateLimitMessage("aiChat", "exceeded")).toBe(AI_MENTOR_RATE_LIMIT_MESSAGE);
  });

  it("enforceAiMentorApiRateLimit checks user then IP", async () => {
    vi.mocked(enforceRateLimit)
      .mockResolvedValueOnce({ allowed: true })
      .mockResolvedValueOnce({ allowed: true });

    const r = await enforceAiMentorApiRateLimit({ userId: "u1", clientIp: "203.0.113.1" });
    expect(r.allowed).toBe(true);
    expect(enforceRateLimit).toHaveBeenCalledTimes(2);
    expect(enforceRateLimit).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ scope: "ai:chat", userId: "u1" }),
    );
    expect(enforceRateLimit).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ scope: "ai:chat:ip", clientIp: "203.0.113.1" }),
    );
  });

  it("returns user denial before IP check", async () => {
    vi.mocked(enforceRateLimit).mockResolvedValueOnce({
      allowed: false,
      retryAfterMs: 1000,
      reason: "exceeded",
    });

    const r = await enforceAiMentorApiRateLimit({ userId: "u1", clientIp: "203.0.113.1" });
    expect(r.allowed).toBe(false);
    expect(enforceRateLimit).toHaveBeenCalledTimes(1);
  });
});
