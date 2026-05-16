import type { LearnerMemorySnapshot, TutorPageContext, TutorTopic } from "@/lib/ai/tutor/types";
import { topicLabelRu } from "@/lib/ai/tutor/classification/topics";

/**
 * Рекомендации по обучению (детерминированные, без LLM).
 */
export function buildLearningRecommendations(
  topic: TutorTopic,
  memory: LearnerMemorySnapshot,
  pageContext: TutorPageContext,
): string[] {
  const recs: string[] = [];

  const p = memory.currentModuleProgress;
  if (p && !p.lessonDone) {
    recs.push("Сначала дочитайте лекцию модуля и отметьте её завершённой — так откроются следующие шаги.");
  } else if (p && !p.testDone) {
    recs.push("Пройдите тест модуля: он закрепляет термины перед практикой.");
  } else if (p && !p.practiceDone) {
    recs.push("Попробуйте практику модуля с подсказками наставника — без спешки к «готовому ответу».");
  }

  switch (topic) {
    case "phishing_social":
      recs.push("Потренируйтесь на учебном разборе письма: ищите отправителя, ссылки и признаки срочности.");
      break;
    case "passwords_auth":
      recs.push("Проверьте свои пароли в менеджере: уникальность важнее «сложной» одной фразы.");
      break;
    case "logging_soc":
      recs.push("Составьте мини-таблицу: событие → время → что проверить дальше (учебный SOC-мышление).");
      break;
    case "crypto_basics":
      recs.push("Разделите «шифрование» и «хеш»: что обратимо, а что только для сравнения отпечатков.");
      break;
    case "practice_help":
      recs.push("Запишите гипотезу в 1 предложении, затем одну проверку, которая её подтвердит или опровергнет.");
      break;
    default:
      if (topic !== "general") {
        recs.push(`Углубите тему «${topicLabelRu(topic)}» в материалах модуля «${pageContext.moduleTitle}».`);
      }
  }

  if (memory.completedModules < memory.totalActiveModules && memory.totalActiveModules > 0) {
    const left = memory.totalActiveModules - memory.completedModules;
    if (left > 0 && left <= 3) {
      recs.push(`До финиша курса осталось модулей: ${left}. Хорошее время для повторения слабых тем.`);
    }
  }

  return [...new Set(recs)].slice(0, 3);
}

export function appendRecommendationsBlock(reply: string, recommendations: string[]): string {
  if (!recommendations.length) return reply;
  const block = [
    "",
    "---",
    "**Что изучить дальше (рекомендации платформы):**",
    ...recommendations.map((r) => `- ${r}`),
  ].join("\n");
  return `${reply.trim()}${block}`;
}
