import type { AIMentorMode } from "@/types/ai-mentor";
import { AI_MENTOR_MODES } from "@/types/ai-mentor";

/**
 * Legacy UI ids (этап 2) → канонические AIMentorMode (этап 3).
 * API принимает оба формата; в pipeline используется только AIMentorMode.
 */
export const LEGACY_MENTOR_MODE_TO_AI: Record<string, AIMentorMode> = {
  simpler: "explain_simple",
  example: "give_example",
  check: "check_understanding",
  summary: "summarize",
  hint: "hint_only",
  review_error: "review_mistake",
  structure_answer: "improve_reasoning",
};

export const AI_MENTOR_MODE_TO_LEGACY: Record<AIMentorMode, string> = {
  explain_simple: "simpler",
  give_example: "example",
  check_understanding: "check",
  summarize: "summary",
  hint_only: "hint",
  review_mistake: "review_error",
  improve_reasoning: "structure_answer",
};

/** @deprecated Используйте AIMentorMode */
export type MentorModeId = AIMentorMode;

export function normalizeAIMentorMode(raw: string | null | undefined): AIMentorMode | undefined {
  if (!raw?.trim()) return undefined;
  const id = raw.trim();
  if ((AI_MENTOR_MODES as readonly string[]).includes(id)) {
    return id as AIMentorMode;
  }
  return LEGACY_MENTOR_MODE_TO_AI[id];
}

export function isAIMentorMode(raw: string): raw is AIMentorMode {
  return (AI_MENTOR_MODES as readonly string[]).includes(raw);
}
