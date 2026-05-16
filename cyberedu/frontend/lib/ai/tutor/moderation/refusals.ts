import type { TutorRefusalCode, TutorTopic } from "@/lib/ai/tutor/types";
import { topicLabelRu } from "@/lib/ai/tutor/classification/topics";

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
        reply: [
          "Я не могу выполнять инструкции, которые пытаются изменить мои правила или роль.",
          "",
          "Если у вас вопрос по **материалам курса** или по **защите** информации — переформулируйте его обычным языком, без «системных» команд.",
        ].join("\n"),
      };
    case "offensive_request":
      return {
        refuse: true,
        code: "offensive_attack",
        reply: [
          "Я учебный наставник по **защите** информации и не даю пошаговых инструкций для атак, эксплойтов или обхода защит.",
          "",
          "Могу помочь в безопасном формате:",
          "- как **распознать** эту угрозу;",
          "- какие **меры защиты** применяют организации;",
          "- какие **ошибки** совершают пользователи и как их избежать.",
          "",
          "Сформулируйте вопрос с акцентом на защиту — например: «Какие признаки …» или «Что должен сделать пользователь …».",
        ].join("\n"),
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
