import { createAIMentorRefusal } from "@/lib/ai/safety/mentor-policy";
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
  const refusal = createAIMentorRefusal("test_answer");
  return {
    refuse: true,
    code: refusal.code,
    reply: refusal.message,
  };
}

export function refusalFooterHint(topic: TutorTopic): string | null {
  if (topic === "general") return null;
  return `_Тема: ${topicLabelRu(topic)} · ответ в учебном режиме защиты._`;
}
