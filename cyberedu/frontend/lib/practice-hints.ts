import type { PracticeHint } from "@/types/practice-view-model";

export const PRACTICE_HINT_DISCLAIMER =
  "Подсказки помогают направить анализ, но не дают готовое решение.";

export const PRACTICE_HINTS_EMPTY_MESSAGE = "Подсказки для этой лаборатории пока не добавлены.";

export const PRACTICE_HINT_LEVEL_META = [
  { level: 1 as const, title: "Подсказка 1", subtitle: "Общее направление" },
  { level: 2 as const, title: "Подсказка 2", subtitle: "На что обратить внимание" },
  { level: 3 as const, title: "Подсказка 3", subtitle: "Более конкретно, без готового ответа" },
] as const;

const HINT_LEAK_PATTERNS: RegExp[] = [
  /эталон/i,
  /\banswer\s*key\b/i,
  /\bsolution\b/i,
  /\bрешени[ея]\s*:/i,
  /готовый ответ/i,
  /правильн(ый|ые)\s+(ответ|вариант|флаг)/i,
  /correctflagids/i,
  /\bexpected\b/i,
  /expectedcommand/i,
  /expectedanswerpattern/i,
  /reflectionpattern/i,
  /autokeywords/i,
  /explanationpattern/i,
  /нужно выбрать/i,
  /нужно отметить/i,
  /введите ровно:/i,
  /команда как в задании/i,
  /\b\d+\s*\/\s*\d+\s*балл/i,
  /засчитываются автоматически/i,
  /полное совпадение/i,
  /ключев(ые|ым)\s+слов/i,
];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Строка подсказки не раскрывает эталон или готовое решение. */
export function isSafePracticeHintLine(text: string): boolean {
  const t = text.trim();
  if (t.length < 12) return false;
  return !HINT_LEAK_PATTERNS.some((re) => re.test(t));
}

function levelMeta(index: number): (typeof PRACTICE_HINT_LEVEL_META)[number] {
  return PRACTICE_HINT_LEVEL_META[index] ?? PRACTICE_HINT_LEVEL_META[PRACTICE_HINT_LEVEL_META.length - 1]!;
}

/** Следующий уровень доступен только после раскрытия предыдущего. */
export function canUnlockPracticeHintLevel(revealedIndices: ReadonlySet<number>, index: number): boolean {
  if (index <= 0) return true;
  return revealedIndices.has(index - 1);
}

function toPracticeHint(content: string, index: number): PracticeHint {
  const meta = levelMeta(index);
  return {
    id: `hint-${meta.level}`,
    level: meta.level,
    title: meta.title,
    content: content.trim(),
  };
}

/** Извлекает и фильтрует подсказки из scenarioData (без solution / answerKey). */
export function buildSafePracticeHints(scenarioData: unknown | null): PracticeHint[] {
  if (!isRecord(scenarioData)) return [];
  const raw = Array.isArray(scenarioData.hints)
    ? scenarioData.hints.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    : [];

  const safe: PracticeHint[] = [];
  for (const line of raw) {
    if (!isSafePracticeHintLine(line)) continue;
    safe.push(toPracticeHint(line, safe.length));
    if (safe.length >= 3) break;
  }
  return safe;
}

/** Нормализует вход для PracticeHints: view model или сырые строки парсера. */
export function normalizePracticeHintsInput(
  hints: PracticeHint[],
  fallbackLevels: string[],
): PracticeHint[] {
  if (hints.length > 0) return hints;
  const fromStrings: PracticeHint[] = [];
  for (const line of fallbackLevels) {
    if (!isSafePracticeHintLine(line)) continue;
    fromStrings.push(toPracticeHint(line, fromStrings.length));
    if (fromStrings.length >= 3) break;
  }
  return fromStrings;
}
