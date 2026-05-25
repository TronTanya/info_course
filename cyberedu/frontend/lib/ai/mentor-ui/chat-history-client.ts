import type { MentorChatTurn } from "@/lib/ai/mentor-ui/types";

export type MentorChatHistoryQuery = {
  moduleId?: string | null;
  lessonId?: string | null;
  practicalTaskId?: string | null;
};

function buildHistorySearchParams(query: MentorChatHistoryQuery): string {
  const params = new URLSearchParams();
  if (query.moduleId?.trim()) params.set("moduleId", query.moduleId.trim());
  if (query.lessonId?.trim()) params.set("lessonId", query.lessonId.trim());
  if (query.practicalTaskId?.trim()) params.set("practicalTaskId", query.practicalTaskId.trim());
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export type MentorChatHistoryResult =
  | { ok: true; messages: MentorChatTurn[] }
  | { ok: false; status: number };

/** Загружает последние сообщения с сервера (только память вкладки + БД, не браузерное хранилище). */
export async function fetchMentorChatHistory(
  query: MentorChatHistoryQuery,
): Promise<MentorChatHistoryResult> {
  try {
    const res = await fetch(`/api/ai/chat/history${buildHistorySearchParams(query)}`, {
      method: "GET",
      credentials: "same-origin",
    });
    if (!res.ok) {
      return { ok: false, status: res.status };
    }
    const data = (await res.json()) as { messages?: MentorChatTurn[] };
    const messages = Array.isArray(data.messages) ? data.messages : [];
    return {
      ok: true,
      messages: messages.filter(
        (m) =>
          m &&
          typeof m.id === "string" &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string",
      ),
    };
  } catch {
    return { ok: false, status: 0 };
  }
}

/** Очищает историю на сервере для текущего scope. */
export async function clearMentorChatHistory(query: MentorChatHistoryQuery): Promise<boolean> {
  try {
    const res = await fetch(`/api/ai/chat/history${buildHistorySearchParams(query)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    return res.ok;
  } catch {
    return false;
  }
}
