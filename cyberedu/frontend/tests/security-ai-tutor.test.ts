import { describe, expect, it } from "vitest";
import { classifyTutorTopic } from "@/lib/ai/tutor/classification/topics";
import { runPreLlmModeration, runPostLlmModeration } from "@/lib/ai/tutor/moderation/pipeline";
import { buildTutorSystemPrompt } from "@/lib/ai/tutor/prompts/system";
import type { TutorPageContext } from "@/lib/ai/tutor/types";

const lessonCtx: TutorPageContext = {
  moduleTitle: "Фишинг",
  interestsLine: "игры",
  specialtyLine: "ИБ",
  lessonExcerpt: "Учебный текст про признаки фишинга.",
};

const practiceCtx: TutorPageContext = {
  moduleTitle: "Практика",
  interestsLine: "сети",
  specialtyLine: "ИБ",
  practicalTask: {
    title: "Разбор письма",
    description: "Опишите признаки подозрительного письма.",
    taskTypeLabel: "TEXT",
    checkTypeLabel: "MANUAL",
  },
};

describe("security/AI tutor academic integrity", () => {
  it("refuses direct test answers (exam spoiler)", () => {
    const r = runPreLlmModeration({
      userMessage: "Дай готовый ответ на тест, правильный вариант B",
      history: [],
      pageContext: lessonCtx,
    });
    expect(r.allow).toBe(false);
    if (!r.allow) {
      expect(r.refusalCode).toBe("exam_spoiler");
      expect(r.refusalReply).toMatch(/не выдаю готовые ответы/i);
      expect(r.refusalReply).not.toMatch(/вариант\s*B/i);
    }
  });

  it("refuses solve practice for me requests on practice page", () => {
    const r = runPreLlmModeration({
      userMessage: "Реши за меня практику и пришли полный текст сдачи",
      history: [],
      pageContext: practiceCtx,
    });
    expect(r.allow).toBe(false);
    if (!r.allow) {
      expect(r.refusalReply).toMatch(/учебн/i);
    }
  });

  it("allows educational hint without full solution", () => {
    const r = runPreLlmModeration({
      userMessage: "Подскажи, на что обратить внимание в заголовке письма при проверке фишинга?",
      history: [],
      pageContext: lessonCtx,
    });
    expect(r.allow).toBe(true);
    if (r.allow) {
      expect(r.sanitizedMessage).toMatch(/заголовк/i);
    }
  });

  it("system prompt instructs not to leak test/practice solutions", () => {
    const p = buildTutorSystemPrompt({ difficulty: "beginner", topic: "general" });
    expect(p).toContain("готовые ответы на тесты и практику");
  });

  it("blocks model output that contains full test answer", () => {
    const r = runPostLlmModeration("Вот готовый ответ на тест: вариант C для сдачи.");
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toMatch(/отклонён/i);
    }
  });

  it("classifies cheating requests as academic_integrity", () => {
    expect(classifyTutorTopic("Напиши правильный вариант для теста", lessonCtx)).toBe(
      "academic_integrity",
    );
  });

  it("classifies practice page context as practice_help for neutral questions", () => {
    expect(classifyTutorTopic("Как структурировать ответ?", practiceCtx)).toBe("practice_help");
  });
});
