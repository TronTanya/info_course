import { describe, expect, it } from "vitest";
import { classifyFormFeedback } from "@/lib/form-feedback";

describe("classifyFormFeedback", () => {
  it("marks rate limit messages", () => {
    const fb = classifyFormFeedback("Слишком много отправок. Подождите и попробуйте позже.");
    expect(fb.kind).toBe("rate_limit");
    expect(fb.title).toContain("частые");
  });

  it("marks unavailable messages", () => {
    const fb = classifyFormFeedback("Сервис временно недоступен. Повторите попытку через несколько минут.");
    expect(fb.kind).toBe("unavailable");
  });

  it("marks validation messages", () => {
    const fb = classifyFormFeedback("Ответьте на все вопросы.");
    expect(fb.kind).toBe("validation");
  });

  it("falls back to generic", () => {
    const fb = classifyFormFeedback("Не удалось сохранить прогресс.");
    expect(fb.kind).toBe("generic");
    expect(fb.description).toContain("прогресс");
  });
});
