import { afterEach, describe, expect, it, vi } from "vitest";
import { callOpenAiChatCompletions } from "@/lib/ai";

describe("callOpenAiChatCompletions (устойчивость к сбоям API)", () => {
  const origKey = process.env.OPENAI_API_KEY;
  const origAi = process.env.AI_API_KEY;
  const origFetch = globalThis.fetch;

  afterEach(() => {
    process.env.OPENAI_API_KEY = origKey;
    process.env.AI_API_KEY = origAi;
    globalThis.fetch = origFetch;
    vi.restoreAllMocks();
  });

  it("null если ключ не задан", async () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_API_KEY;
    await expect(
      callOpenAiChatCompletions([{ role: "user", content: "hi" }]),
    ).resolves.toBeNull();
  });

  it("null при ошибке сети / HTTP", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.OPENAI_API_KEY = "sk-test";
    delete process.env.AI_API_KEY;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down"));
    await expect(
      callOpenAiChatCompletions([{ role: "user", content: "hi" }]),
    ).resolves.toBeNull();
    errSpy.mockRestore();
  });
});
