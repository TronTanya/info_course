/**
 * Блокирует явные запросы на вредоносную деятельность и обход защит (грубый фильтр).
 * Не заменяет модерацию ответа модели.
 */
const BLOCK_PATTERNS: RegExp[] = [
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
];

export function assertSafeTutorUserMessage(message: string): { ok: true } | { ok: false; reason: string } {
  const t = message.trim();
  if (t.length === 0) return { ok: false, reason: "Пустое сообщение." };
  if (t.length > 8000) return { ok: false, reason: "Сообщение слишком длинное." };

  const lower = t.toLowerCase();
  for (const p of BLOCK_PATTERNS) {
    if (p.test(lower)) {
      return { ok: false, reason: "Запрос отклонён политикой безопасности." };
    }
  }
  return { ok: true };
}
