/** Превращает «сырой» текст модели в предсказуемый markdown для UI. */

const KONSPEKT_TITLE = /^конспект\s*:/i;
const NUMBERED_SECTION = /^(\d+)\.\s+(.+)$/;
const ANALOGY_LINE = /^(?:•\s*)?(аналогия|пример|важно)\s*:/i;
const DASH_ITEM = /^[—–-]\s+/;
const BLOCKQUOTE = /^>\s+/;

/** Одна строка → markdown-разметка для парсера. */
export function structureMentorLine(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return "";

  if (KONSPEKT_TITLE.test(trimmed)) {
    return `## ${trimmed}`;
  }

  const section = NUMBERED_SECTION.exec(trimmed);
  if (section && trimmed.length <= 160) {
    return `### ${section[1]}. ${section[2].trim()}`;
  }

  if (ANALOGY_LINE.test(trimmed)) {
    return `> ${trimmed}`;
  }

  if (DASH_ITEM.test(trimmed)) {
    return `- ${trimmed.replace(DASH_ITEM, "")}`;
  }

  if (BLOCKQUOTE.test(trimmed)) return trimmed;

  return line;
}

/** Нормализует весь ответ наставника перед рендером. */
export function structureMentorReply(source: string): string {
  return source
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => structureMentorLine(line))
    .join("\n");
}

export function isMentorCalloutLine(text: string): boolean {
  const t = text.trim();
  return ANALOGY_LINE.test(t) || BLOCKQUOTE.test(t);
}

export function calloutKindFromText(text: string): "analogy" | "tip" | "note" {
  const t = text.trim().replace(BLOCKQUOTE, "");
  if (/^аналогия/i.test(t) || /^пример/i.test(t)) return "analogy";
  if (/^важно/i.test(t)) return "tip";
  return "note";
}
