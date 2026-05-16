import { moderateAiOutput, moderateUserPrompt } from "@/lib/security/ai-moderation";
import { scanPromptInjection } from "@/lib/ai/tutor/moderation/injection";
import type { TutorChatTurn } from "@/lib/ai/tutor/types";

export const CHAT_HISTORY_LIMITS = {
  maxItems: 12,
  maxItemChars: 4_000,
  maxTotalChars: 20_000,
  maxClientItems: 8,
} as const;

export type ClientHistoryIssue =
  | "too_many_items"
  | "item_too_long"
  | "invalid_role"
  | "invalid_shape"
  | "bad_alternation"
  | "untrusted_assistant";

export type ClientHistoryValidation = {
  /** Сообщения user-only из клиента (assistant отброшен). */
  userOnlyTurns: TutorChatTurn[];
  droppedAssistant: number;
  issues: ClientHistoryIssue[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

/**
 * Клиентская history не используется для LLM; проверяем на злоупотребления и отбрасываем assistant.
 */
export function validateUntrustedClientHistory(raw: unknown): ClientHistoryValidation {
  const issues: ClientHistoryIssue[] = [];
  const userOnlyTurns: TutorChatTurn[] = [];
  let droppedAssistant = 0;

  if (!Array.isArray(raw)) {
    if (raw != null && raw !== undefined) issues.push("invalid_shape");
    return { userOnlyTurns, droppedAssistant, issues };
  }

  if (raw.length > CHAT_HISTORY_LIMITS.maxClientItems) {
    issues.push("too_many_items");
  }

  for (const item of raw.slice(-CHAT_HISTORY_LIMITS.maxClientItems)) {
    if (!isRecord(item)) {
      issues.push("invalid_shape");
      continue;
    }
    const role = item.role;
    const content = item.content;
    if (role !== "user" && role !== "assistant") {
      issues.push("invalid_role");
      continue;
    }
    if (typeof content !== "string") {
      issues.push("invalid_shape");
      continue;
    }
    if (content.length > CHAT_HISTORY_LIMITS.maxItemChars) {
      issues.push("item_too_long");
    }
    if (role === "assistant") {
      droppedAssistant += 1;
      issues.push("untrusted_assistant");
      continue;
    }
    const mod = moderateUserPrompt(content, CHAT_HISTORY_LIMITS.maxItemChars);
    if (!mod.ok) continue;
    userOnlyTurns.push({ role: "user", content: mod.text });
  }

  return { userOnlyTurns, droppedAssistant, issues };
}

/**
 * Доверенная история с сервера: строгая очередность user → assistant, лимиты, модерация.
 */
export function prepareTrustedChatHistory(turns: TutorChatTurn[]): TutorChatTurn[] {
  const out: TutorChatTurn[] = [];
  let totalChars = 0;
  let expectRole: "user" | "assistant" = "user";

  for (const h of turns.slice(-CHAT_HISTORY_LIMITS.maxItems)) {
    if (h.role !== expectRole) continue;

    const maxLen = CHAT_HISTORY_LIMITS.maxItemChars;
    if (h.role === "user") {
      const injection = scanPromptInjection(h.content, maxLen);
      if (!injection.safe) continue;
      const mod = moderateUserPrompt(injection.text, maxLen);
      if (!mod.ok) continue;
      if (totalChars + mod.text.length > CHAT_HISTORY_LIMITS.maxTotalChars) break;
      out.push({ role: "user", content: mod.text });
      totalChars += mod.text.length;
      expectRole = "assistant";
    } else {
      const mod = moderateAiOutput(h.content, 8, maxLen);
      if (!mod.ok) continue;
      if (totalChars + mod.text.length > CHAT_HISTORY_LIMITS.maxTotalChars) break;
      out.push({ role: "assistant", content: mod.text });
      totalChars += mod.text.length;
      expectRole = "user";
    }
  }

  return out;
}
