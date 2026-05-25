import { sanitizeLessonContentForPrompt } from "@/lib/ai/tutor/moderation/lesson-content";
import { AI_MENTOR_FORBIDDEN_CONTEXT_KEYS } from "@/lib/ai/mentor-ui/forbidden-context";
import type { Recommendation, StrongTopic, WeakTopic } from "@/types/test-view-model";
import type { AIMentorContextInput } from "@/types/ai-mentor";
import { AI_MENTOR_LOCALE } from "@/types/ai-mentor";

const MAX_EXCERPT = 2_000;
const MAX_TOPIC = 80;

const FORBIDDEN_SET = new Set<string>(AI_MENTOR_FORBIDDEN_CONTEXT_KEYS);

const LEAK_PATTERNS: RegExp[] = [
  /правильн(ый|ые)\s+ответ/i,
  /\banswer\s*key\b/i,
  /correctoption/i,
  /верный\s+вариант/i,
];

function cleanTopicLabel(raw: string | null | undefined): string | undefined {
  const t = raw?.trim();
  if (!t || t.length > MAX_TOPIC) return undefined;
  if (LEAK_PATTERNS.some((re) => re.test(t))) return undefined;
  return t;
}

function cleanPublicText(raw: string | null | undefined, maxLen: number): string | undefined {
  const t = raw?.trim();
  if (!t) return undefined;
  if (LEAK_PATTERNS.some((re) => re.test(t))) return undefined;
  return sanitizeLessonContentForPrompt(t, maxLen);
}

/** Публичные рекомендации UI (без ссылок на ключи и скрытые поля). */
export function formatTestSafeRecommendations(
  recommendations: Recommendation[] | null | undefined,
): string | undefined {
  if (!recommendations?.length) return undefined;
  const lines = recommendations
    .map((r) => {
      const title = r.title?.trim();
      if (!title) return null;
      const desc = cleanPublicText(r.description, 240);
      return desc ? `${title}: ${desc}` : title;
    })
    .filter((line): line is string => line != null);
  if (!lines.length) return undefined;
  return sanitizeLessonContentForPrompt(lines.join("\n"), MAX_EXCERPT);
}

export type BuildTestResultAIMentorContextInputOpts = {
  moduleId: string;
  attemptId: string;
  testTitle: string;
  moduleTitle: string;
  safeTopic?: string;
  weakTopics?: WeakTopic[];
  strongTopics?: StrongTopic[];
  recommendations?: Recommendation[];
};

/**
 * Канонический AIMentorContextInput после теста.
 * Без correct answers, selected answers, answerKey, scoring rules, hidden explanations.
 */
export function buildTestResultAIMentorContextInput(
  opts: BuildTestResultAIMentorContextInputOpts,
): AIMentorContextInput {
  const weakLabels = (opts.weakTopics ?? [])
    .map((t) => cleanTopicLabel(t.title))
    .filter((label): label is string => label != null);

  const strongLabels = (opts.strongTopics ?? [])
    .map((t) => cleanTopicLabel(t.title))
    .filter((label): label is string => label != null);

  const safeExcerpt = formatTestSafeRecommendations(opts.recommendations);

  const input: AIMentorContextInput = {
    sourceType: "test_result",
    sourceId: opts.attemptId.trim(),
    moduleTitle: opts.moduleTitle.trim() || "Модуль",
    testTitle: opts.testTitle.trim() || "Тест",
    safeTopic: (opts.safeTopic ?? opts.moduleTitle).trim() || undefined,
    weakTopics: weakLabels.length ? weakLabels : undefined,
    strongTopics: strongLabels.length ? strongLabels : undefined,
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
