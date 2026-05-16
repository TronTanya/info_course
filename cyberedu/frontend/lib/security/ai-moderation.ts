import { sanitizePlainText } from "@/lib/security/sanitize";

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
  /\bsystem\s*:\s*/i,
  /\b(jailbreak|dan\s+mode)\b/i,
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
];

export type ModerationResult = { ok: true; text: string } | { ok: false; reason: string };

export function moderateUserPrompt(message: string, maxLen = 8000): ModerationResult {
  const t = sanitizePlainText(message, maxLen);
  if (t.length === 0) return { ok: false, reason: "Пустое сообщение." };
  const lower = t.toLowerCase();
  for (const p of USER_BLOCK_PATTERNS) {
    if (p.test(lower)) {
      return { ok: false, reason: "Запрос отклонён политикой безопасности." };
    }
  }
  return { ok: true, text: t };
}

export function moderateAiOutput(response: string, minLen = 8, maxLen = 80_000): ModerationResult {
  const text = response.trim();
  if (text.length < minLen) return { ok: false, reason: "Ответ слишком короткий." };
  if (text.length > maxLen) return { ok: false, reason: "Ответ слишком длинный." };
  const lower = text.toLowerCase();
  for (const p of OUTPUT_BLOCK_SUBSTRINGS) {
    if (lower.includes(p)) {
      return { ok: false, reason: "Ответ отклонён модерацией." };
    }
  }
  return { ok: true, text };
}

export type ChatHistoryItem = { role: "user" | "assistant"; content: string };

/**
 * История диалога только с серверной санитизацией — снижает prompt injection через поддельный role=assistant.
 */
export function sanitizeChatHistory(
  history: ChatHistoryItem[],
  maxItems = 24,
  maxItemLen = 12_000,
): ChatHistoryItem[] {
  const out: ChatHistoryItem[] = [];
  for (const h of history.slice(-maxItems)) {
    if (h.role !== "user" && h.role !== "assistant") continue;
    const content = sanitizePlainText(h.content, maxItemLen);
    if (!content) continue;
    const mod =
      h.role === "user"
        ? moderateUserPrompt(content, maxItemLen)
        : moderateUserPrompt(content, maxItemLen).ok
          ? moderateAiOutput(content, 1, maxItemLen)
          : { ok: false as const, reason: "blocked" };
    if (!mod.ok) continue;
    out.push({ role: h.role, content: mod.text });
  }
  return out;
}
