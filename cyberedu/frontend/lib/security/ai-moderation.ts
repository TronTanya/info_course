import { sanitizePlainText } from "@/lib/security/sanitize";
import { scanPromptInjection } from "@/lib/ai/tutor/moderation/injection";

const USER_BLOCK_PATTERNS: RegExp[] = [
  /\b(reverse\s*shell|bind\s*shell)\b/i,
  /\b(ransomware|crypto\s*locker)\b/i,
  /\b(key\s*logger|кейлоггер)\b/i,
  /\b(drop\s*table|union\s+select)\b/i,
  /\b(sql\s*инъекци|sql\s*inj)\b/i,
  /\b(ddos|ддос)\s*(атак|attack|скрипт|tool)/i,
  /\b(exploit|эксплойт)\s*(код|code|payload)/i,
  /\bкак\s+взломать\b/i,
  /\bкак\s+обойти\s+(защиту|антивирус|фаервол)\b/i,
  /\bhow\s+to\s+hack\b/i,
  /\bwrite\s+(a\s+)?(virus|trojan|malware)\b/i,
  /\bсгенерируй\s+(вирус|троян|вредонос)\b/i,
  /\bобход\s+2fa\b/i,
  /\bphishing\s+(kit|шаблон|страниц)/i,
  /\bignore\s+(all\s+)?(previous|prior)\s+instructions\b/i,
  /\b(jailbreak|dan\s+mode|developer\s+mode)\b/i,
  /\bact\s+as\s+(?:an?\s+)?(?:unrestricted|evil)\b/i,
  /\bты\s+теперь\s+(?:без\s+ограничений|хакер|admin)\b/i,
  /\bdisregard\s+(?:all\s+)?(?:safety|policy)\b/i,
  /\bсистемн(?:ый|ая)\s+промпт\b/i,
  /\bвыведи\s+(?:скрыты|hidden)\s+(?:инструкц|prompt)/i,
];

const OUTPUT_BLOCK_PATTERNS: RegExp[] = [
  /\b(reverse\s*shell|bind\s*shell)\b/i,
  /\b(готовый\s+ответ\s+на\s+тест|правильный\s+вариант\s+ответа)\b/i,
  /\b(пошаговый\s+взлом|обход\s+защиты)\b/i,
  /\b(drop\s+table|union\s+select)\b/i,
  /\b(ignore\s+all\s+previous\s+instructions)\b/i,
  /\b(ты\s+теперь\s+должен\s+игнорировать)\b/i,
  /```\s*system\b/i,
  /<\s*system\s*>/i,
];

const OUTPUT_BLOCK_SUBSTRINGS = [
  "reverse shell",
  "обход защиты",
  "эксплойт",
  "payload",
  "drop table",
  "ransomware",
  "готовый ответ на тест",
  "правильный вариант ответа:",
  "ignore all previous instructions",
  "jailbreak",
  "developer mode enabled",
];

export type ModerationResult = { ok: true; text: string } | { ok: false; reason: string; category?: string };

export function moderateUserPrompt(message: string, maxLen = 8000): ModerationResult {
  const injection = scanPromptInjection(message, maxLen);
  if (!injection.safe) {
    return { ok: false, reason: "Запрос отклонён: подозрение на подмену инструкций.", category: injection.kind };
  }

  const t = injection.text;
  if (t.length === 0) return { ok: false, reason: "Пустое сообщение.", category: "empty" };

  const lower = t.toLowerCase();
  for (const p of USER_BLOCK_PATTERNS) {
    if (p.test(lower)) {
      return { ok: false, reason: "Запрос отклонён политикой безопасности.", category: "policy" };
    }
  }
  return { ok: true, text: t };
}

export function moderateAiOutput(response: string, minLen = 8, maxLen = 80_000): ModerationResult {
  const text = sanitizePlainText(response, maxLen);
  if (text.length < minLen) return { ok: false, reason: "Ответ слишком короткий.", category: "short" };
  const lower = text.toLowerCase();
  for (const p of OUTPUT_BLOCK_PATTERNS) {
    if (p.test(lower)) {
      return { ok: false, reason: "Ответ отклонён модерацией.", category: "pattern" };
    }
  }
  for (const p of OUTPUT_BLOCK_SUBSTRINGS) {
    if (lower.includes(p)) {
      return { ok: false, reason: "Ответ отклонён модерацией.", category: "substring" };
    }
  }
  return { ok: true, text };
}

export type ChatHistoryItem = { role: "user" | "assistant"; content: string };

/**
 * @deprecated История только с сервера (`loadTrustedChatHistory`). Клиентский assistant не принимается.
 */
export function sanitizeChatHistory(
  history: ChatHistoryItem[],
  maxItems = 12,
  maxItemLen = 4_000,
): ChatHistoryItem[] {
  const out: ChatHistoryItem[] = [];
  for (const h of history.slice(-maxItems)) {
    if (h.role !== "user") continue;
    const mod = moderateUserPrompt(h.content, maxItemLen);
    if (!mod.ok) continue;
    out.push({ role: "user", content: mod.text });
  }
  return out;
}
