import type { KeyTerm } from "@/types/lesson-view-model";

/** Оптимальное число терминов в сетке урока (этап 6). */
export const KEY_TERMS_DISPLAY_MAX = 6;

export const KEY_TERMS_EMPTY_MESSAGE = "Ключевые термины будут добавлены позже.";

function normalizeTerm(term: string): string {
  return term.trim();
}

function dedupeKeyTerms(terms: KeyTerm[]): KeyTerm[] {
  const out: KeyTerm[] = [];
  const seen = new Set<string>();
  for (const entry of terms) {
    const term = normalizeTerm(entry.term);
    if (!term) continue;
    const key = term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      term,
      definition: entry.definition?.trim() || "—",
    });
    if (out.length >= KEY_TERMS_DISPLAY_MAX) break;
  }
  return out;
}

/** Тема урока (для аналитики / тестов; fallback-термины не подставляются). */
export function lessonContentSuggestsPhishingTopic(source: string, lessonTitle?: string): boolean {
  const sample = `${lessonTitle ?? ""}\n${source}`.slice(0, 8000);
  return /фишинг|phishing|социальн[а-яё]*\s+инженер|подозрительн[а-яё]*\s+письм|электронн[а-яё]*\s+почт/i.test(
    sample,
  );
}

/**
 * Термины для UI: только из разбора контента / БД, до 6 штук, без синтетических списков.
 */
export function resolveLessonKeyTerms(
  extracted: KeyTerm[],
  _content?: string,
  _lessonTitle?: string,
  max: number = KEY_TERMS_DISPLAY_MAX,
): KeyTerm[] {
  return dedupeKeyTerms(extracted).slice(0, max);
}
