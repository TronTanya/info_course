import { stripControlChars, stripHtmlTags } from "@/lib/security/sanitize";

const MAX_LESSON_EXCERPT = 8_000;
const MAX_TASK_DESC = 5_000;

/** Подозрительные разделители / «системные» вставки в учебном тексте. */
const PROMPT_DELIMITER_PATTERNS: RegExp[] = [
  /```\s*system\b/gi,
  /<\s*\/?\s*system\b[^>]*>/gi,
  /<\s*script[\s>][\s\S]*?<\/\s*script\s*>/gi,
  /<\s*style[\s>][\s\S]*?<\/\s*style\s*>/gi,
  /\[\[?\s*INST\s*\]?\]/gi,
  /###\s*(system|instructions|новые\s+инструкции)\b/gi,
  /<\s*assistant\s*>/gi,
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/gi,
  /переопредели\s+(роль|правила|инструкции)/gi,
];

/**
 * Очистка лекции / описания практики перед вставкой в промпт модели.
 */
export function sanitizeLessonContentForPrompt(raw: string, maxLen = MAX_LESSON_EXCERPT): string {
  let text = raw;
  text = text.replace(/<\s*script[\s\S]*?<\/\s*script\s*>/gi, " ");
  text = text.replace(/<\s*style[\s\S]*?<\/\s*style\s*>/gi, " ");
  text = stripHtmlTags(text);
  text = stripControlChars(text);

  for (const pattern of PROMPT_DELIMITER_PATTERNS) {
    text = text.replace(pattern, " ");
  }

  text = text.replace(/\n{4,}/g, "\n\n\n").trim();
  if (text.length > maxLen) {
    return `${text.slice(0, maxLen)}\n\n[…фрагмент сокращён для безопасного контекста…]`;
  }
  return text;
}

export function sanitizeTaskDescriptionForPrompt(raw: string): string {
  return sanitizeLessonContentForPrompt(raw, MAX_TASK_DESC);
}
