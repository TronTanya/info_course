/**
 * Совместимость: тонкая обёртка над `lib/ai/tutor`.
 * Новый код должен импортировать из `@/lib/ai/tutor`.
 */
import { AiNotConfiguredError, AiProviderError, getOpenAiApiKey } from "@/lib/ai-config";
import { fallbackTutorReply } from "@/lib/ai/tutor/fallbacks";
import {
  checkTypeLabel,
  practicalTaskTypeLabel,
  toPracticalContext,
} from "@/lib/ai/tutor/context/page-context";
import { runTutorPipeline } from "@/lib/ai/tutor/pipeline";
import type { TutorChatTurn, TutorPageContext, TutorPracticalContext } from "@/lib/ai/tutor/types";

export type { TutorPageContext, TutorPracticalContext };
export type TutorChatHistoryItem = TutorChatTurn;

export { practicalTaskTypeLabel, checkTypeLabel, toPracticalContext };

/** @deprecated Используйте buildTutorSystemPrompt из `@/lib/ai/tutor` */
export { EXAMPLE_SYSTEM_PROMPT as TUTOR_CHAT_SYSTEM_PROMPT } from "@/lib/ai/tutor/prompts/system";

export const TUTOR_PRACTICE_SOCRATIC_EXTRA = [
  "### Режим «подсказка к практике»",
  "Ученик явно запросил наводку по практическому заданию.",
  "Не выдавай готовое решение, не перечисляй правильный ответ и не раскрывай эталон построчно.",
  "Ответь только наводящими вопросами (обычно 1–3 коротких вопроса), которые помогают самому дойти до вывода.",
].join("\n");

export type RunTutorChatParams = {
  userMessage: string;
  pageContext: TutorPageContext;
  history: TutorChatTurn[];
  systemPromptExtra?: string;
  /** Требуется для memory / audit в pipeline */
  userId?: string;
  practiceSocraticHints?: boolean;
};

export async function runTutorChat(params: RunTutorChatParams): Promise<string> {
  if (!params.userId) {
    throw new Error("runTutorChat: userId is required for production pipeline");
  }

  if (!getOpenAiApiKey()) {
    throw new AiNotConfiguredError();
  }

  try {
    const result = await runTutorPipeline({
      userId: params.userId,
      userMessage: params.userMessage,
      pageContext: params.pageContext,
      history: params.history,
      practiceSocraticHints: params.practiceSocraticHints ?? Boolean(params.systemPromptExtra),
    });
    return result.reply;
  } catch (e) {
    if (e instanceof AiNotConfiguredError || e instanceof AiProviderError) throw e;
    return fallbackTutorReply({ reason: "provider_down" });
  }
}

/** @deprecated внутренний helper — используйте runTutorPipeline */
export function buildTutorChatMessages(): never {
  throw new Error("buildTutorChatMessages removed; use runTutorPipeline");
}
