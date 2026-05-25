import type { LessonObjective } from "@/types/lesson-view-model";

/** Текст-заглушка из mapper — не показываем как измеримую цель. */
export const LESSON_OBJECTIVE_PLACEHOLDER =
  "Прочитайте материал и отметьте урок изученным, чтобы открыть следующие шаги модуля.";

/** Показываем от 1 до 4 реальных целей; UI рассчитан на 2–4 при полном контенте. */
const MIN_OBJECTIVES = 1;
const MAX_OBJECTIVES = 4;

function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function isPlaceholderObjective(text: string): boolean {
  const n = normalizeText(text).toLowerCase();
  return n === normalizeText(LESSON_OBJECTIVE_PLACEHOLDER).toLowerCase();
}

function dedupeObjectives(items: LessonObjective[]): LessonObjective[] {
  const out: LessonObjective[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const text = normalizeText(item.text);
    if (!text || isPlaceholderObjective(text)) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ text });
    if (out.length >= MAX_OBJECTIVES) break;
  }
  return out;
}

/**
 * Цели для UI: только реальные пункты из контента (2–4 при наличии).
 * Описание урока — один честный fallback, без выдуманных формулировок.
 */
export function resolveLessonDisplayObjectives(
  objectives: LessonObjective[],
  description: string | null,
): { items: LessonObjective[]; source: "content" | "description" | "empty" } {
  const fromContent = dedupeObjectives(objectives);
  if (fromContent.length >= MIN_OBJECTIVES) {
    return { items: fromContent.slice(0, MAX_OBJECTIVES), source: "content" };
  }

  const desc = description ? normalizeText(description) : "";
  if (desc && !isPlaceholderObjective(desc) && desc.length >= 16) {
    return { items: [{ text: desc }], source: "description" };
  }

  return { items: [], source: "empty" };
}
