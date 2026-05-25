/**
 * Поля и паттерны, запрещённые в AI context (клиент и сервер).
 */

export const AI_MENTOR_FORBIDDEN_CONTEXT_KEYS = [
  "correctOptionId",
  "correctAnswerId",
  "correctAnswer",
  "isCorrect",
  "correctFlags",
  "correctFlagIds",
  "questionAnswers",
  "answerOptions",
  "requiredIds",
  "answerKey",
  "solution",
  "solutionText",
  "hiddenRubric",
  "gradingRubric",
  "rubric",
  "safeRubric",
  "autoKeywords",
  "autoCheckRules",
  "rawScoringRules",
  "scoringRules",
  "reflectionPattern",
  "explanationPattern",
  "expected",
  "expectedCommand",
  "expectedAnswerPattern",
  "interactiveExpectedAnswer",
  "adminNotes",
  "adminComment",
  "internalNotes",
  "graderNotes",
  "privateStoragePath",
  "storagePath",
  "fileDownloadUrl",
  "apiKey",
  "api_key",
  "env",
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "userEmail",
  "email",
  "scenarioData",
  "evidenceItems",
  "testAnswers",
  "practiceAnswers",
  "selectedAnswers",
  "selectedOptionId",
  "selectedOptionIds",
] as const;

export type AIMentorForbiddenContextKey = (typeof AI_MENTOR_FORBIDDEN_CONTEXT_KEYS)[number];

const FORBIDDEN_KEY_SET = new Set<string>(AI_MENTOR_FORBIDDEN_CONTEXT_KEYS);

/** Подстроки в excerpt/draft, указывающие на утечку эталона. */
export const AI_MENTOR_FORBIDDEN_EXCERPT_PATTERNS: RegExp[] = [
  /grading\s*rubric/i,
  /hidden\s*rubric/i,
  /\banswer\s*key\b/i,
  /\bcorrectoption/i,
  /\bsolution\b/i,
  /correctflagids/i,
  /auto\s*keywords/i,
  /эталон/i,
  /правильн(ый|ые)\s+вариант/i,
  /\bOPENAI_/i,
  /\bAI_API_KEY\b/i,
  /process\.env/i,
  /\bsk-[a-z0-9]{10,}/i,
  /\bBearer\s+[a-z0-9._-]{20,}/i,
];

export function isForbiddenContextKey(key: string): boolean {
  return FORBIDDEN_KEY_SET.has(key);
}

export function findForbiddenKeysInRecord(value: Record<string, unknown>): string[] {
  return Object.keys(value).filter(isForbiddenContextKey);
}

const DEEP_STRIP_MAX_DEPTH = 5;

/**
 * Рекурсивно удаляет запрещённые ключи (в т.ч. вложенные объекты с клиента).
 */
export function deepStripForbiddenFromUnknown(
  value: unknown,
  depth = 0,
): { safe: Record<string, unknown>; strippedKeys: string[] } {
  if (depth > DEEP_STRIP_MAX_DEPTH) {
    return { safe: {}, strippedKeys: [] };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { safe: {}, strippedKeys: [] };
  }

  const record = value as Record<string, unknown>;
  const strippedKeys: string[] = [];
  const safe: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(record)) {
    if (isForbiddenContextKey(key)) {
      strippedKeys.push(key);
      continue;
    }
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const nested = deepStripForbiddenFromUnknown(val, depth + 1);
      strippedKeys.push(...nested.strippedKeys.map((k) => `${key}.${k}`));
      if (Object.keys(nested.safe).length > 0) {
        safe[key] = nested.safe;
      }
      continue;
    }
    safe[key] = val;
  }

  return { safe, strippedKeys };
}
