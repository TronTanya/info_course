import { afterEach, describe, expect, it } from "vitest";
import { runTutorChat } from "@/lib/ai-chat";
import { AiNotConfiguredError } from "@/lib/ai-config";

describe("runTutorChat без ключа AI", () => {
  const origOpen = process.env.OPENAI_API_KEY;
  const origAi = process.env.AI_API_KEY;

  afterEach(() => {
    process.env.OPENAI_API_KEY = origOpen;
    process.env.AI_API_KEY = origAi;
  });

  it("бросает AiNotConfiguredError", async () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_API_KEY;

    await expect(
      runTutorChat({
        userId: "test-user-id",
        userMessage: "Что такое фишинг?",
        pageContext: {
          moduleTitle: "Тест",
          interestsLine: "не указаны",
          specialtyLine: "не указана",
        },
        history: [],
      }),
    ).rejects.toBeInstanceOf(AiNotConfiguredError);
  });
});
