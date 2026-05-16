import { describe, expect, it } from "vitest";
import { getOpenAiApiKey, isAiConfigured } from "@/lib/ai-config";

/**
 * Лёгкие smoke-проверки без браузера: импорт ключевых модулей и базовая логика env.
 */
describe("smoke: проект собирается логически", () => {
  it("ai-config доступен", () => {
    expect(typeof getOpenAiApiKey).toBe("function");
    expect(typeof isAiConfigured).toBe("function");
  });
});
