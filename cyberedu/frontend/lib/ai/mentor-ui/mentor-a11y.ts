import { isMentorSafetyRefusalTurn } from "@/lib/ai/mentor-ui/chat-state";
import type { MentorChatTurn } from "@/lib/ai/mentor-ui/types";

export const MENTOR_COMPOSER_INPUT_ID = "mentor-message-input";
export const MENTOR_COMPOSER_ERROR_ID = "mentor-composer-error";
export const MENTOR_COMPOSER_MODE_HINT_ID = "mentor-mode-active-hint";
export const MENTOR_MESSAGES_LIVE_ID = "mentor-messages-live";

export function getMentorClearConfirmMessage(clearsServerHistory: boolean): string {
  if (clearsServerHistory) {
    return "Очистить диалог? История наставника для этой страницы на сервере тоже будет сброшена.";
  }
  return "Очистить сообщения в этой сессии?";
}

export type BuildMentorLiveAnnouncementInput = {
  loading: boolean;
  historyLoading: boolean;
  error: string | null;
  showError: boolean;
  showDisabled: boolean;
  messages: MentorChatTurn[];
  lastAnnouncedAssistantId: string | null;
};

/** Краткое объявление для aria-live (без длинных ответов и технических деталей). */
export function buildMentorLiveAnnouncement(input: BuildMentorLiveAnnouncementInput): {
  text: string;
  lastAssistantId: string | null;
} {
  if (input.historyLoading) {
    return { text: "Загрузка истории диалога.", lastAssistantId: input.lastAnnouncedAssistantId };
  }
  if (input.loading) {
    return { text: "Наставник готовит ответ.", lastAssistantId: input.lastAnnouncedAssistantId };
  }
  if (input.showError && input.error) {
    return { text: `Ошибка: ${input.error}`, lastAssistantId: input.lastAnnouncedAssistantId };
  }
  if (input.showDisabled) {
    return { text: "AI-наставник недоступен.", lastAssistantId: input.lastAnnouncedAssistantId };
  }

  const last = input.messages[input.messages.length - 1];
  if (last?.role === "assistant" && last.id !== input.lastAnnouncedAssistantId) {
    if (isMentorSafetyRefusalTurn(last.meta)) {
      return {
        text: "Получен ответ наставника: запрос ограничен политикой обучения.",
        lastAssistantId: last.id,
      };
    }
    const preview = last.content.replace(/\s+/g, " ").trim().slice(0, 100);
    const suffix = last.content.length > 100 ? "…" : "";
    return {
      text: preview ? `Получен ответ наставника: ${preview}${suffix}` : "Получен ответ наставника.",
      lastAssistantId: last.id,
    };
  }

  return { text: "", lastAssistantId: input.lastAnnouncedAssistantId };
}

export function mentorComposerDescribedBy(opts: {
  draftOverLimit: boolean;
  hasError: boolean;
  modeActive: boolean;
}): string {
  return [
    opts.draftOverLimit ? "mentor-draft-limit-hint" : "mentor-draft-hint",
    opts.hasError ? MENTOR_COMPOSER_ERROR_ID : null,
    opts.modeActive ? MENTOR_COMPOSER_MODE_HINT_ID : null,
  ]
    .filter(Boolean)
    .join(" ");
}
