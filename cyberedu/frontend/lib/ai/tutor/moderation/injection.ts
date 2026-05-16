import { sanitizePlainText } from "@/lib/security/sanitize";

export type InjectionScanResult =
  | { safe: true; text: string }
  | { safe: false; reason: string; kind: "delimiter" | "role_override" | "encoded_blob" | "excessive_control" };

const DELIMITER_ATTACKS = [
  /```\s*system/i,
  /<\s*\/?\s*system\s*>/i,
  /\[\[?\s*INST\s*\]?\]/i,
  /###\s*новые\s+инструкции/i,
  /переопредели\s+роль/i,
];

/**
 * Anti-prompt-injection: эвристики поверх базовой модерации.
 */
export function scanPromptInjection(raw: string, maxLen = 8000): InjectionScanResult {
  const text = sanitizePlainText(raw, maxLen);
  if (!text) return { safe: false, reason: "Пустое сообщение.", kind: "excessive_control" };

  for (const p of DELIMITER_ATTACKS) {
    if (p.test(text)) {
      return { safe: false, reason: "Обнаружена попытка подмены инструкций.", kind: "delimiter" };
    }
  }

  if (/\b(ты|you)\s+(теперь|are\s+now)\s+(admin|root|hacker|без\s+ограничений)/i.test(text)) {
    return { safe: false, reason: "Обнаружена попытка смены роли.", kind: "role_override" };
  }

  // Длинные base64-подобные вставки
  const b64 = text.match(/[A-Za-z0-9+/]{200,}={0,2}/);
  if (b64) {
    return { safe: false, reason: "Подозрительная закодированная вставка.", kind: "encoded_blob" };
  }

  const controlRatio = (text.match(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g) ?? []).length / Math.max(text.length, 1);
  if (controlRatio > 0.05) {
    return { safe: false, reason: "Некорректные управляющие символы.", kind: "excessive_control" };
  }

  return { safe: true, text };
}
