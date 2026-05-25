import { describe, expect, it } from "vitest";
import { createAIMentorRefusal, detectAssessmentAnswerRequest } from "@/lib/ai/safety/mentor-policy";
import { formatMentorRefusalMessage } from "@/lib/ai/safety/mentor-refusal-copy";
import {
  getMentorRefusalStructuredUi,
  MENTOR_REFUSAL_SUGGESTED_ACTIONS,
  shouldShowStructuredRefusal,
} from "@/lib/ai/mentor-ui/refusal-ui";

describe("mentor-refusal-ui (ETAP 14)", () => {
  it("detects ETAP 14 cheat phrases", () => {
    expect(detectAssessmentAnswerRequest("дай правильный ответ")).toBe("choose_option");
    expect(detectAssessmentAnswerRequest("реши тест")).toBe("test_answer");
    expect(detectAssessmentAnswerRequest("напиши практику за меня")).toBe("full_practice_solution");
    expect(detectAssessmentAnswerRequest("какой вариант выбрать")).toBe("choose_option");
    expect(detectAssessmentAnswerRequest("дай готовое решение")).toBe("solution_disclosure");
  });

  it("createAIMentorRefusal has four-part structured message", () => {
    const r = createAIMentorRefusal("choose_option", { topicLabel: "фишинг" });
    expect(r.structured.denial).toMatch(/не могу выбрать/i);
    expect(r.structured.reason.length).toBeGreaterThan(10);
    expect(r.structured.alternative).toMatch(/фишинг/i);
    expect(r.structured.learnAction).toMatch(/план анализа/i);
    expect(r.message).toBe(formatMentorRefusalMessage(r.structured));
    expect(r.message).toMatch(/\*\*Почему:\*\*/);
    expect(r.message).toMatch(/\*\*Чем могу помочь:\*\*/);
  });

  it("suggested actions match ETAP 14 labels", () => {
    expect(MENTOR_REFUSAL_SUGGESTED_ACTIONS.map((a) => a.label)).toEqual([
      "Объясни тему",
      "Дай подсказку",
      "Проверь моё понимание",
      "Составь план анализа",
    ]);
  });

  it("structured UI uses refusalKind when provided", () => {
    const ui = getMentorRefusalStructuredUi({
      refusalKind: "full_practice_solution",
      topicLabel: "логи",
    });
    expect(ui.denial).toMatch(/практик/i);
    expect(ui.alternative).toMatch(/план анализа/i);
  });

  it("shouldShowStructuredRefusal for exam spoiler refusals", () => {
    expect(
      shouldShowStructuredRefusal({
        topic: "academic_integrity",
        difficulty: "beginner",
        recommendations: [],
        refused: true,
        refusalCode: "exam_spoiler",
        refusalKind: "choose_option",
      }),
    ).toBe(true);
    expect(
      shouldShowStructuredRefusal({
        topic: "general",
        difficulty: "beginner",
        recommendations: [],
        refused: true,
        refusalCode: "output_blocked",
      }),
    ).toBe(false);
  });
});
