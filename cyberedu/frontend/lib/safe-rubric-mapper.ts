import type { PracticalTaskType } from "@prisma/client";
import type { SafeRubricCriterionKind, SafeRubricItem } from "@/types/practice-view-model";

/** Ключи сценария, из которых можно читать публичную рубрику для студента. */
const PUBLIC_RUBRIC_ROOT_KEYS = ["publicRubric", "studentRubric", "evaluationCriteria"] as const;

/** Никогда не показывать студенту (включая поле criteria с эталонами в seed). */
const FORBIDDEN_RUBRIC_KEYS = new Set([
  "gradingRubric",
  "hiddenRubric",
  "criteria",
  "scoringRubric",
  "rawScoringRules",
  "scoringRules",
  "answerKey",
  "solution",
  "solutionText",
  "correctFlagIds",
  "requiredIds",
  "reflectionPattern",
  "autoKeywords",
  "explanationPattern",
  "expected",
  "expectedCommand",
  "expectedAnswerPattern",
  "interactiveExpectedAnswer",
]);

/** Строки, раскрывающие эталон, regex или правильные варианты. */
const RUBRIC_LEAK_PATTERNS: RegExp[] = [
  /\bэталон/i,
  /\banswer\s*key\b/i,
  /\bcorrect\s*flag/i,
  /\brequired\s*ids?\b/i,
  /\breflection\s*pattern\b/i,
  /\bauto\s*keywords?\b/i,
  /\bexplanation\s*pattern\b/i,
  /\bregex\b/i,
  /\bregexp\b/i,
  /полное совпадение/i,
  /совпадени[ея]\s+с/i,
  /нужн(ый|ые)\s+уровен/i,
  /верн(ый|ые)\s+тип/i,
  /верн(ый|ые)\s+вариант/i,
  /правильн(ые|ый)\s+вариант/i,
  /ключев(ые|ым)\s+слов/i,
  /слова\s+из\s+проверки/i,
  /correctflagids/i,
  /\b\d+\s*\/\s*\d+\s*—/i,
  /засчитываются автоматически/i,
  /проходит проверку по/i,
  /не короче минимума и проходит/i,
  /как в задании/i,
  /ровно ту команду/i,
];

export type SafeRubricCriterionDraft = {
  title: string;
  description?: string;
  kind?: SafeRubricCriterionKind;
};

export const DEFAULT_SAFE_RUBRIC_CRITERIA: readonly SafeRubricCriterionDraft[] = [
  {
    title: "Полнота анализа",
    description: "Ответ охватывает существенные элементы сценария и не обходит важные детали.",
    kind: "analysis",
  },
  {
    title: "Корректность аргументации",
    description: "Выводы опираются на представленные данные; логика изложена последовательно.",
    kind: "reasoning",
  },
  {
    title: "Выявление ключевых признаков",
    description: "Отмечены значимые индикаторы риска или события без перечисления «правильного списка» задания.",
    kind: "indicators",
  },
  {
    title: "Безопасные рекомендации",
    description: "Предложены действия, соответствующие политике безопасности; без инструкций для реальных атак.",
    kind: "safety",
  },
  {
    title: "Аккуратность оформления ответа",
    description: "Структура, ясность формулировок и соблюдение формата, указанного в задании.",
    kind: "presentation",
  },
] as const;

const TASK_TYPE_RUBRIC_HINTS: Partial<
  Record<PracticalTaskType, Partial<Record<SafeRubricCriterionKind, string>>>
> = {
  PHISHING_ANALYSIS: {
    indicators: "Укажите подозрительные элементы письма и объясните, почему они настораживают.",
  },
  URL_ANALYSIS: {
    indicators: "Разберите признаки ссылки (домен, протокол, опечатки) без открытия подозрительных URL.",
  },
  LOG_ANALYSIS: {
    indicators: "Свяжите записи журнала с предполагаемым инцидентом, опираясь на хронологию.",
  },
  TRAINING_CONSOLE: {
    analysis: "Опишите результат учебной команды своими словами, без копирования скрытого эталона.",
  },
  INTERACTIVE: {
    analysis: "Опишите результат действий в симуляторе; эталонная команда в интерфейсе не показывается.",
  },
  SITUATION_CHOICE: {
    reasoning: "Обоснуйте выбор по каждой ситуации; правильные комбинации в интерфейсе не отображаются.",
  },
  PASSWORD_ANALYSIS: {
    indicators: "Оцените признаки стойкости пароля; конкретные «правильные» метки задания скрыты.",
  },
  CHECKLIST: {
    presentation: "Отметьте пункты чек-листа и кратко опишите, что применяете на практике.",
  },
  CRYPTO_TASK: {
    analysis: "Поясните шаги решения учебных задач; готовые ответы и паттерны проверки не публикуются.",
  },
  TEXT_ANSWER: {
    presentation: "Соблюдайте минимальный объём и структуру отчёта из инструкции.",
  },
  FILE_UPLOAD: {
    presentation: "Прикрепите файл допустимого типа; исполняемые и небезопасные форматы не принимаются.",
  },
  COMBINED: {
    presentation: "Сочетайте текстовый отчёт и вложение в рамках требований задания.",
  },
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Проверка, что строка критерия не раскрывает решение или скрытую рубрику. */
export function isSafeRubricLine(text: string): boolean {
  const t = text.trim();
  if (t.length < 8) return false;
  if (FORBIDDEN_RUBRIC_KEYS.has(t.toLowerCase())) return false;
  return !RUBRIC_LEAK_PATTERNS.some((re) => re.test(t));
}

function normalizePublicEntry(raw: unknown): SafeRubricCriterionDraft | null {
  if (typeof raw === "string") {
    const title = raw.trim();
    if (!isSafeRubricLine(title)) return null;
    return { title };
  }
  if (!isRecord(raw)) return null;
  if (raw.hidden === true || raw.adminOnly === true || raw.internal === true) return null;

  const title = str(raw.title) || str(raw.label) || str(raw.name) || str(raw.criterion);
  const description = str(raw.description) || str(raw.hint) || undefined;
  if (!title || !isSafeRubricLine(title)) return null;
  if (description && !isSafeRubricLine(description)) return null;

  return { title, description: description || undefined };
}

function collectRubricArray(value: unknown): SafeRubricCriterionDraft[] {
  if (!Array.isArray(value)) return [];
  const out: SafeRubricCriterionDraft[] = [];
  for (const entry of value) {
    const norm = normalizePublicEntry(entry);
    if (norm) out.push(norm);
  }
  return out;
}

/**
 * Извлекает только явно публичные критерии из scenarioData.
 * Поля criteria / gradingRubric / hiddenRubric игнорируются.
 */
export function extractPublicRubricFromScenario(scenarioData: unknown | null): SafeRubricCriterionDraft[] {
  if (!isRecord(scenarioData)) return [];

  const out: SafeRubricCriterionDraft[] = [];
  for (const key of PUBLIC_RUBRIC_ROOT_KEYS) {
    out.push(...collectRubricArray(scenarioData[key]));
  }

  const deduped: SafeRubricCriterionDraft[] = [];
  const seen = new Set<string>();
  for (const item of out) {
    const k = item.title.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(item);
  }
  return deduped.slice(0, 12);
}

function defaultCriteriaForTaskType(taskType: PracticalTaskType): SafeRubricCriterionDraft[] {
  const hints = TASK_TYPE_RUBRIC_HINTS[taskType];
  return DEFAULT_SAFE_RUBRIC_CRITERIA.map((base) => {
    const kind = base.kind;
    const override =
      kind && hints && typeof hints === "object" && kind in hints
        ? (hints as Record<string, string>)[kind]
        : undefined;
    return {
      ...base,
      description: override ?? base.description,
    };
  });
}

function toSafeRubricItems(drafts: SafeRubricCriterionDraft[], maxScore: number): SafeRubricItem[] {
  const perItem =
    maxScore > 0 && drafts.length > 0 ? Math.max(1, Math.floor(maxScore / drafts.length)) : undefined;

  return drafts.map((d, i) => ({
    id: `safe-rubric-${i + 1}`,
    title: d.title,
    description: d.description,
    kind: d.kind,
    points: perItem,
  }));
}

export type BuildSafeRubricPreviewInput = {
  scenarioData: unknown | null;
  taskType: PracticalTaskType;
  maxScore?: number;
};

/**
 * Публичные критерии для SafeRubricPreview.
 * Если в данных только скрытая rubric (criteria / gradingRubric) — показываются нейтральные defaults.
 */
export function buildSafeRubricPreviewItems(input: BuildSafeRubricPreviewInput): SafeRubricItem[] {
  const publicFromScenario = extractPublicRubricFromScenario(input.scenarioData);
  const drafts =
    publicFromScenario.length > 0 ? publicFromScenario : defaultCriteriaForTaskType(input.taskType);
  return toSafeRubricItems(drafts, input.maxScore ?? 0);
}

/** @deprecated Используйте buildSafeRubricPreviewItems */
export function mapScenarioToSafeRubric(
  scenarioData: unknown | null,
  taskType: PracticalTaskType,
  maxScore = 0,
): SafeRubricItem[] {
  return buildSafeRubricPreviewItems({ scenarioData, taskType, maxScore });
}
