import type { TutorRefusalCode, TutorTopic } from "@/lib/ai/tutor/types";
import { topicLabelRu } from "@/lib/ai/tutor/classification/topics";

/**
 * Fallback-ответы, когда LLM недоступна или ответ отклонён пост-модерацией.
 */
export function fallbackTutorReply(opts: {
  reason: TutorRefusalCode | "provider_down";
  topic?: TutorTopic;
}): string {
  const topicHint = opts.topic ? ` по теме «${topicLabelRu(opts.topic)}»` : "";

  switch (opts.reason) {
    case "provider_down":
      return [
        "Сейчас AI-наставник временно недоступен (сервис модели не ответил).",
        "",
        "Пока можно:",
        "- перечитать фрагмент лекции в модуле;",
        "- записать один конкретный вопрос и попробовать снова через несколько минут;",
        "- обсудить формулировку задания с одногруппником **без** передачи готового ответа.",
      ].join("\n");
    case "output_blocked":
      return [
        `Ответ модели не прошёл проверку безопасности${topicHint}.`,
        "",
        "Попробуйте переформулировать вопрос: что вы хотите **понять** (термин, логика, тип угрозы), а не «как сделать атаку/задание».",
      ].join("\n");
    default:
      return "Не удалось сформировать безопасный ответ. Попробуйте переформулировать вопрос в учебном ключе.";
  }
}
