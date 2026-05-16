export const LESSON_AI_ACTIONS = [
  "simpler",
  "adapt_interests",
  "example",
  "summary",
  "ask_assistant",
] as const;

export type LessonAiAction = (typeof LESSON_AI_ACTIONS)[number];

export type LessonAiMetaV1 = {
  v: 1;
  action: LessonAiAction;
  /** Для ask_assistant */
  question?: string;
  /** Строка интересов профиля на момент генерации (для подписи в UI). */
  interestsSnapshot?: string;
  /** Специальность из профиля на момент генерации. */
  specialtySnapshot?: string;
};

export function isLessonAiAction(value: string): value is LessonAiAction {
  return (LESSON_AI_ACTIONS as readonly string[]).includes(value);
}

export function serializeLessonAiMeta(meta: LessonAiMetaV1): string {
  return JSON.stringify(meta);
}

export function parseLessonAiMeta(raw: string | null | undefined): LessonAiMetaV1 | null {
  if (!raw?.trim()) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const o = data as Record<string, unknown>;
    if (o.v !== 1 || typeof o.action !== "string" || !isLessonAiAction(o.action)) return null;
    return {
      v: 1,
      action: o.action,
      question: typeof o.question === "string" ? o.question : undefined,
      interestsSnapshot: typeof o.interestsSnapshot === "string" ? o.interestsSnapshot : undefined,
      specialtySnapshot: typeof o.specialtySnapshot === "string" ? o.specialtySnapshot : undefined,
    };
  } catch {
    return null;
  }
}

export function lessonAiActionLabel(action: LessonAiAction): string {
  const map: Record<LessonAiAction, string> = {
    simpler: "Проще",
    adapt_interests: "Под интересы",
    example: "Пример",
    summary: "Конспект",
    ask_assistant: "Вопрос",
  };
  return map[action];
}
