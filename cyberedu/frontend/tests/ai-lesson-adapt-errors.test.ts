import { afterEach, describe, expect, it } from "vitest";
import { adaptLessonToInterests } from "@/lib/ai";
import { AiNotConfiguredError } from "@/lib/ai-config";

describe("adaptLessonToInterests без ключа AI", () => {
  const origOpen = process.env.OPENAI_API_KEY;
  const origAi = process.env.AI_API_KEY;

  afterEach(() => {
    process.env.OPENAI_API_KEY = origOpen;
    process.env.AI_API_KEY = origAi;
  });

  it("бросает AiNotConfiguredError, без mock-текста", async () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.AI_API_KEY;

    await expect(
      adaptLessonToInterests({
        lessonTitle: "Тест",
        lessonContent: "Конфиденциальность — это про доступ к данным.",
        userInterests: "игры",
        userSpecialty: "ИБ",
        mode: "simplify",
      }),
    ).rejects.toBeInstanceOf(AiNotConfiguredError);
  });
});
