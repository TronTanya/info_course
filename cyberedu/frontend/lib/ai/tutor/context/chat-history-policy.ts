import type { MentorSurface } from "@/lib/ai/mentor-ui/surfaces";

/** Сообщений в UI (последние реплики по scope). */
export const MENTOR_CHAT_HISTORY_UI_LIMIT = 24;

/**
 * Практика: не пишем реплики в БД — ответы заданий и черновики не должны накапливаться в истории.
 * Урок / тест / дашборд: серверная память для continuity (только текст чата, без meta/draft).
 */
export function shouldPersistTutorChatHistory(surface: MentorSurface): boolean {
  return surface !== "practice";
}
