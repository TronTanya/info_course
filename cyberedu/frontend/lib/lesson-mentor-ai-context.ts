import { sanitizeLessonContentForPrompt } from "@/lib/ai/tutor/moderation/lesson-content";
import { AI_MENTOR_FORBIDDEN_CONTEXT_KEYS } from "@/lib/ai/mentor-ui/forbidden-context";
import type { AIMentorContextInput } from "@/types/ai-mentor";
import { AI_MENTOR_LOCALE } from "@/types/ai-mentor";

const MAX_EXCERPT = 1_500;

const FORBIDDEN_SET = new Set<string>(AI_MENTOR_FORBIDDEN_CONTEXT_KEYS);

/** Публичные метаданные урока (без тела лекции и без данных теста). */
export function formatLessonPublicExcerpt(input: {
  description?: string | null;
  objectives?: Array<{ text?: string | null }>;
  keyTerms?: Array<{ term?: string | null; definition?: string | null }>;
}): string | undefined {
  const parts: string[] = [];
  const desc = input.description?.trim();
  if (desc) parts.push(desc);

  if (input.objectives?.length) {
    const lines = input.objectives
      .map((o, i) => {
        const text = o.text?.trim();
        if (!text) return null;
        return `${i + 1}. ${text}`;
      })
      .filter((line): line is string => line != null);
    if (lines.length) parts.push(`Цели урока:\n${lines.join("\n")}`);
  }

  if (input.keyTerms?.length) {
    const terms = input.keyTerms
      .map((t) => {
        const term = t.term?.trim();
        if (!term) return null;
        const def = t.definition?.trim();
        return def ? `${term}: ${def}` : term;
      })
      .filter((line): line is string => line != null);
    if (terms.length) parts.push(`Термины:\n${terms.join("; ")}`);
  }

  if (!parts.length) return undefined;
  return sanitizeLessonContentForPrompt(parts.join("\n\n"), MAX_EXCERPT);
}

export type BuildLessonAIMentorContextInputOpts = {
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  /** Тема модуля / раздела для safeTopic. */
  safeTopic?: string;
  description?: string | null;
  objectives?: Array<{ text?: string | null }>;
  keyTerms?: Array<{ term?: string | null; definition?: string | null }>;
};

/**
 * Канонический AIMentorContextInput для страницы урока.
 * Без testAnswers, полного content лекции и закрытых полей модуля.
 * Полный excerpt для LLM сервер подставляет из БД при доступе к уроку.
 */
export function buildLessonAIMentorContextInput(
  opts: BuildLessonAIMentorContextInputOpts,
): AIMentorContextInput {
  const safeExcerpt = formatLessonPublicExcerpt({
    description: opts.description,
    objectives: opts.objectives,
    keyTerms: opts.keyTerms,
  });

  const input: AIMentorContextInput = {
    sourceType: "lesson",
    sourceId: opts.lessonId.trim(),
    moduleTitle: opts.moduleTitle.trim() || "Модуль",
    lessonTitle: opts.lessonTitle.trim() || "Урок",
    safeTopic: (opts.safeTopic ?? opts.moduleTitle).trim() || undefined,
    safeExcerpt,
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
