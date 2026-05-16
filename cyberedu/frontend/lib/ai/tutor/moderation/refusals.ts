import type { TutorRefusalCode, TutorTopic } from "@/lib/ai/tutor/types";
import { topicLabelRu } from "@/lib/ai/tutor/classification/topics";
import { getRefusalTemplate } from "@/lib/ai/tutor/moderation/refusal-templates";

export type RefusalDecision = {
  refuse: true;
  code: TutorRefusalCode;
  reply: string;
};

/**
 * Refusal policies — безопасные ответы без вызова LLM.
 */
export function evaluateRefusalPolicy(topic: TutorTopic): RefusalDecision | null {
  switch (topic) {
    case "prompt_injection":
      return {
        refuse: true,
        code: "prompt_injection",
        reply: getRefusalTemplate("prompt_injection"),
      };
    case "offensive_request":
      return {
        refuse: true,
        code: "offensive_attack",
        reply: getRefusalTemplate("offensive_attack"),
      };
    default:
      return null;
  }
}

export function softRefusalAcademicIntegrity(): RefusalDecision {
  return {
    refuse: true,
    code: "exam_spoiler",
    reply: [
      "Я не выдаю готовые ответы на тесты и практику — это часть учебной честности курса.",
      "",
      "Вместо этого давай разберём:",
      "1) что именно в формулировке задания вызывает затруднение;",
      "2) какие **критерии** «правильного» решения ты уже знаешь;",
      "3) какой **первый шаг** ты можешь сделать сам(а) за 5 минут.",
      "",
      "Напиши, на каком шаге ты застрял(а).",
    ].join("\n"),
  };
}

export function refusalFooterHint(topic: TutorTopic): string | null {
  if (topic === "general") return null;
  return `_Тема: ${topicLabelRu(topic)} · ответ в учебном режиме защиты._`;
}
