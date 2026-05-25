/**
 * Пояснения после теста: только обучающий текст с сервера, без правильных вариантов в UI.
 * Не подставляем текст ответов и не показываем «ключ» к вопросу.
 */

const UNSAFE_PATTERNS = [
  /правильн(?:ый|ая|ое)?\s+ответ/i,
  /верный\s+вариант/i,
  /correct\s+answer/i,
  /isCorrect/i,
  /ключ\s+ответа/i,
  /answer\s+key/i,
  /вариант\s+[A-DА-Д]\s*(?:—|–|-|:|\)|\.)/i,
  /solution\s+text/i,
  /текст\s+решения/i,
  /разбор\s+правильного/i,
];

export function isSafeTestExplanation(raw: string | null | undefined): boolean {
  const t = raw?.trim();
  if (!t || t.length < 8) return false;
  if (UNSAFE_PATTERNS.some((p) => p.test(t))) return false;
  return true;
}

/** Безопасное пояснение для UI или null (тогда показываем общий текст без спойлера). */
export function safeTestExplanation(raw: string | null | undefined): string | null {
  if (!isSafeTestExplanation(raw)) return null;
  return raw!.trim().slice(0, 1200);
}
