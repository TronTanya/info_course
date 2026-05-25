import { sanitizeLessonContentForPrompt } from "@/lib/ai/tutor/moderation/lesson-content";
import { PRACTICE_MENTOR_FORBIDDEN_CONTEXT_KEYS } from "@/lib/practice-mentor-panel";
import type { PracticeInstruction, PracticeScenario } from "@/types/practice-view-model";
import type { AIMentorContextInput } from "@/types/ai-mentor";
import { AI_MENTOR_LOCALE } from "@/types/ai-mentor";

const MAX_SCENARIO = 1_200;
const MAX_INSTRUCTIONS = 2_400;
const MAX_DESCRIPTION = 1_500;

const FORBIDDEN_SET = new Set<string>(PRACTICE_MENTOR_FORBIDDEN_CONTEXT_KEYS);

const LEAK_PATTERNS: RegExp[] = [
  /grading\s*rubric/i,
  /hidden\s*rubric/i,
  /\banswer\s*key\b/i,
  /\bsolution\b/i,
  /correctflagids/i,
  /auto\s*keywords/i,
  /auto\s*check\s*rules/i,
  /эталон/i,
  /правильн(ый|ые)\s+вариант/i,
];

function cleanPublicText(raw: string | null | undefined, maxLen: number): string | undefined {
  const t = raw?.trim();
  if (!t) return undefined;
  if (LEAK_PATTERNS.some((re) => re.test(t))) return undefined;
  return sanitizeLessonContentForPrompt(t, maxLen);
}

/** Безопасное резюме сценария для AI (только role / context / goal). */
export function formatPracticeScenarioSummary(scenario: PracticeScenario | null | undefined): string | undefined {
  if (!scenario) return undefined;
  const parts: string[] = [];
  if (scenario.role?.trim()) parts.push(`Роль: ${scenario.role.trim()}`);
  if (scenario.context?.trim()) parts.push(`Контекст: ${scenario.context.trim()}`);
  if (scenario.goal?.trim()) parts.push(`Цель: ${scenario.goal.trim()}`);
  if (!parts.length) return undefined;
  return cleanPublicText(parts.join("\n"), MAX_SCENARIO);
}

/** Публичные инструкции студенту (нумерованный список, без рубрики). */
export function formatPracticePublicInstructions(
  instructions: PracticeInstruction[] | null | undefined,
): string | undefined {
  if (!instructions?.length) return undefined;
  const lines = instructions
    .map((item, index) => {
      const text = item.text?.trim();
      if (!text) return null;
      return `${index + 1}. ${text}`;
    })
    .filter((line): line is string => line != null);
  if (!lines.length) return undefined;
  return cleanPublicText(lines.join("\n"), MAX_INSTRUCTIONS);
}

export type BuildPracticeAIMentorContextInputOpts = {
  moduleId: string;
  practicalTaskId: string;
  practiceTitle: string;
  moduleTitle: string;
  safeTopic?: string;
  taskDescription?: string | null;
  scenario?: PracticeScenario | null;
  instructions?: PracticeInstruction[] | null;
  argumentDraft?: string | null;
};

/**
 * Канонический AIMentorContextInput для страницы практики (клиент → API).
 * sourceType practice, без solution / answerKey / rubric / admin notes.
 */
export function buildPracticeAIMentorContextInput(
  opts: BuildPracticeAIMentorContextInputOpts,
): AIMentorContextInput {
  const scenarioSummary = formatPracticeScenarioSummary(opts.scenario);
  const publicInstructions = formatPracticePublicInstructions(opts.instructions);
  const safeExcerpt = cleanPublicText(opts.taskDescription, MAX_DESCRIPTION);

  const input: AIMentorContextInput = {
    sourceType: "practice",
    sourceId: opts.practicalTaskId.trim(),
    moduleTitle: opts.moduleTitle.trim() || "Модуль",
    practiceTitle: opts.practiceTitle.trim() || "Практика",
    safeTopic: (opts.safeTopic ?? opts.practiceTitle).trim() || undefined,
    safeExcerpt,
    scenarioSummary,
    publicInstructions,
    locale: AI_MENTOR_LOCALE,
  };

  return stripForbiddenFromAIMentorInput(input);
}

function stripForbiddenFromAIMentorInput(input: AIMentorContextInput): AIMentorContextInput {
  const out: AIMentorContextInput = { ...input };
  for (const key of Object.keys(out)) {
    if (FORBIDDEN_SET.has(key)) {
      delete (out as Record<string, unknown>)[key];
    }
  }
  return out;
}
