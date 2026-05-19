function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function firstParagraph(text: string): string | null {
  const p = text.split(/\n\n+/).map((s) => s.trim()).find(Boolean);
  return p ?? null;
}

export type ParsedPracticeScenario = {
  studentRole: string | null;
  taskBrief: string | null;
  inputData: string | null;
  expectedOutcome: string | null;
  hintLevels: string[];
};

/**
 * Разбор учебного сценария без раскрытия эталонных ответов (только публичные поля JSON).
 */
export function parsePracticeScenario(
  description: string,
  instruction: string | null,
  consoleScenario: string | null,
  scenarioData: unknown,
): ParsedPracticeScenario {
  const sd = isRecord(scenarioData) ? scenarioData : null;

  const hintLevels =
    sd && Array.isArray(sd.hints)
      ? sd.hints.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      : [];

  const studentRole =
    (typeof sd?.studentRole === "string" && sd.studentRole.trim()) ||
    extractRoleLine(description) ||
    "Специалист по информационной безопасности (учебная роль)";

  const taskBrief =
    instruction?.trim() ||
    (typeof sd?.task === "string" ? sd.task.trim() : null) ||
    firstParagraph(description);

  const inputData =
    consoleScenario?.trim() ||
    (typeof sd?.artifacts === "string" ? sd.artifacts.trim() : null) ||
    (typeof sd?.inputData === "string" ? sd.inputData.trim() : null) ||
    null;

  const expectedOutcome =
    (typeof sd?.expectedResult === "string" && sd.expectedResult.trim()) ||
    (typeof sd?.expectedOutcome === "string" && sd.expectedOutcome.trim()) ||
    (typeof sd?.criteria === "string" && sd.criteria.trim()) ||
    "Корректный отчёт или выбор по критериям задания — без нарушения политики безопасности.";

  return {
    studentRole,
    taskBrief,
    inputData,
    expectedOutcome,
    hintLevels,
  };
}

function extractRoleLine(description: string): string | null {
  for (const line of description.split("\n")) {
    const t = line.trim();
    if (/^(роль|ваша роль|вы —|вы -)/i.test(t)) return t.replace(/^роль:\s*/i, "").trim() || t;
  }
  return null;
}
