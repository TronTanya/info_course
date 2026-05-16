import type { LessonAiAction } from "@/lib/lesson-ai-meta";
import { adaptLessonToInterests, type LessonAdaptMode } from "@/lib/ai";

/**
 * Запрос к генератору лекции. Реализация делегирует в `lib/ai.ts` (`adaptLessonToInterests`).
 */
export type LessonGenerationRequest = {
  action: LessonAiAction;
  lessonTitle: string;
  lessonContent: string;
  /** Компактное описание интересов (только теги/текст из профиля) */
  interestsPromptBlock?: string;
  /** Специальность из профиля */
  userSpecialty?: string;
  /** Только для `ask_assistant` */
  userQuestion?: string;
};

export interface LessonAiGenerator {
  generate(req: LessonGenerationRequest): Promise<string>;
}

function actionToMode(action: LessonAiAction): LessonAdaptMode {
  switch (action) {
    case "simpler":
      return "simplify";
    case "adapt_interests":
      return "adapt_to_interests";
    case "example":
      return "example";
    case "summary":
      return "summary";
    case "ask_assistant":
      return "simplify";
  }
}

export class LessonPipelineAiGenerator implements LessonAiGenerator {
  async generate(req: LessonGenerationRequest): Promise<string> {
    const interests = (req.interestsPromptBlock?.trim() || "не указаны").replace(/^—$/, "не указаны");
    const specialty = req.userSpecialty?.trim() && req.userSpecialty.trim() !== "—" ? req.userSpecialty.trim() : "";

    if (req.action === "ask_assistant") {
      return adaptLessonToInterests({
        lessonTitle: req.lessonTitle,
        lessonContent: req.lessonContent,
        userInterests: interests,
        userSpecialty: specialty,
        mode: "simplify",
        userQuestion: req.userQuestion,
      });
    }

    const mode = actionToMode(req.action);

    return adaptLessonToInterests({
      lessonTitle: req.lessonTitle,
      lessonContent: req.lessonContent,
      userInterests: interests,
      userSpecialty: specialty,
      mode,
    });
  }
}

/**
 * Фабрика генератора: при необходимости подмените класс (A/B тест, другой провайдер).
 */
export function getLessonAiGenerator(): LessonAiGenerator {
  return new LessonPipelineAiGenerator();
}
