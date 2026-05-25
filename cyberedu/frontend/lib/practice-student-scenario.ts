/**
 * Подготовка scenarioData для клиента: без эталонов, ключей проверки и admin-only полей.
 * Серверная проверка использует полный JSON из БД.
 */

/** Ключи, которые нельзя отдавать в UI/API клиента (см. PRACTICE_VIEW_MODEL_FORBIDDEN_KEYS). */
const ROOT_STRIP_KEYS = new Set([
  "correctFlagIds",
  "requiredIds",
  "reflectionPattern",
  "autoKeywords",
  "explanationPattern",
  "answerKey",
  "solution",
  "solutionText",
  "gradingRubric",
  "hiddenRubric",
  "scoringRubric",
  "rawScoringRules",
  "scoringRules",
  "criteria",
  "expectedCommand",
  "expectedAnswerPattern",
  "interactiveExpectedAnswer",
  "adminNotes",
  "internalNotes",
  "graderNotes",
  "privateStoragePath",
  "storagePath",
  "userEmail",
  "apiKey",
]);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function omitKeys(raw: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!keys.includes(key)) out[key] = value;
  }
  return out;
}

function stripSituation(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  return omitKeys(raw, ["expected", "answer", "correct"]);
}

function stripPasswordItem(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  return omitKeys(raw, ["expectedStrength", "expected"]);
}

function stripUrlItem(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  return omitKeys(raw, ["expected", "explanationPattern"]);
}

function stripGenericObject(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (ROOT_STRIP_KEYS.has(key)) continue;

    if (key === "situations" && Array.isArray(value)) {
      out[key] = value.map(stripSituation);
      continue;
    }
    if (key === "items" && Array.isArray(value)) {
      out[key] = value.map(stripPasswordItem);
      continue;
    }
    if (key === "urls" && Array.isArray(value)) {
      out[key] = value.map(stripUrlItem);
      continue;
    }
    if (isRecord(value)) {
      out[key] = stripGenericObject(value);
      continue;
    }
    out[key] = value;
  }
  return out;
}

/** Безопасная копия scenarioData для UI практики. */
export function sanitizeScenarioDataForStudent(scenarioData: unknown): unknown | null {
  if (scenarioData == null) return null;
  if (!isRecord(scenarioData)) return null;
  return stripGenericObject(scenarioData);
}
