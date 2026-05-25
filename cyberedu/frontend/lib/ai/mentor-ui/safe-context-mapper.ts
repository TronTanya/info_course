import {
  AI_MENTOR_FORBIDDEN_EXCERPT_PATTERNS,
  deepStripForbiddenFromUnknown,
} from "@/lib/ai/mentor-ui/forbidden-context";
import type { MentorSurface } from "@/lib/ai/mentor-ui/surfaces";
import type {
  AIMentorContext,
  AIMentorContextInput,
  AIMentorLocale,
  AIMentorMode,
  AIMentorSourceType,
} from "@/types/ai-mentor";
import { AI_MENTOR_LOCALE } from "@/types/ai-mentor";

const MAX_TITLE = 200;
const MAX_TOPIC = 120;
const MAX_EXCERPT = 12_000;
const MAX_DRAFT = 2_000;
const MAX_WEAK_TOPICS = 8;
const MAX_WEAK_TOPIC_LEN = 80;
const MAX_SOURCE_ID = 64;

export type SanitizeAIMentorContextResult = {
  context: AIMentorContext;
  strippedKeys: string[];
  draftAllowed: boolean;
};

export type MapAIMentorContextServerInput = {
  sourceType: AIMentorSourceType;
  sourceId?: string | null;
  moduleTitle?: string | null;
  lessonTitle?: string | null;
  practiceTitle?: string | null;
  testTitle?: string | null;
  safeTopic?: string | null;
  safeExcerpt?: string | null;
  weakTopics?: string[] | null;
  strongTopics?: string[] | null;
  userDraft?: string | null;
  /** Разрешить черновик (практика + явный режим). */
  allowUserDraft?: boolean;
  locale?: string | null;
};

function cleanLine(raw: string | null | undefined, maxLen: number): string | undefined {
  if (raw == null) return undefined;
  const t = String(raw).replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return undefined;
  if (AI_MENTOR_FORBIDDEN_EXCERPT_PATTERNS.some((re) => re.test(t))) return undefined;
  if (t.length <= maxLen) return t;
  const slice = t.slice(0, maxLen - 1).trim();
  const sp = slice.lastIndexOf(" ");
  return `${(sp > 24 ? slice.slice(0, sp) : slice)}…`;
}

function cleanWeakTopics(topics: string[] | null | undefined): string[] | undefined {
  if (!topics?.length) return undefined;
  const out: string[] = [];
  for (const raw of topics) {
    const label = cleanLine(raw, MAX_WEAK_TOPIC_LEN);
    if (label) out.push(label);
    if (out.length >= MAX_WEAK_TOPICS) break;
  }
  return out.length ? out : undefined;
}

function cleanSourceId(raw: string | null | undefined): string | undefined {
  const t = raw?.trim();
  if (!t || t.length > MAX_SOURCE_ID) return undefined;
  if (/^https?:\/\//i.test(t) || t.includes("..")) return undefined;
  return t;
}

function resolveLocale(raw: string | null | undefined): AIMentorLocale {
  return raw?.trim().toLowerCase() === AI_MENTOR_LOCALE ? AI_MENTOR_LOCALE : AI_MENTOR_LOCALE;
}

/** Удаляет запрещённые ключи из произвольного объекта (включая вложенные). */
export function stripForbiddenFromUnknown(
  value: unknown,
): { safe: Record<string, unknown>; strippedKeys: string[] } {
  return deepStripForbiddenFromUnknown(value);
}

/**
 * Санитизация частичного контекста с клиента (или API).
 * Игнорирует лишние поля; не доверяет excerpt/draft без очистки.
 */
export function sanitizeAIMentorContextInput(
  input: AIMentorContextInput | Record<string, unknown> | null | undefined,
  opts?: { allowUserDraft?: boolean; defaultSourceType?: AIMentorSourceType },
): SanitizeAIMentorContextResult {
  const { safe, strippedKeys } = stripForbiddenFromUnknown(input);
  const raw = safe as AIMentorContextInput;

  const sourceType =
    raw.sourceType && isAIMentorSourceType(raw.sourceType)
      ? raw.sourceType
      : (opts?.defaultSourceType ?? "general");

  const draftAllowed = Boolean(opts?.allowUserDraft) && sourceType === "practice";
  const userDraft = draftAllowed ? cleanLine(raw.userDraft, MAX_DRAFT) : undefined;

  const context: AIMentorContext = {
    sourceType,
    locale: resolveLocale(raw.locale),
    sourceId: cleanSourceId(raw.sourceId),
    moduleTitle: cleanLine(raw.moduleTitle, MAX_TITLE),
    lessonTitle: cleanLine(raw.lessonTitle, MAX_TITLE),
    practiceTitle: cleanLine(raw.practiceTitle, MAX_TITLE),
    testTitle: cleanLine(raw.testTitle, MAX_TITLE),
    safeTopic: cleanLine(raw.safeTopic, MAX_TOPIC),
    safeExcerpt: cleanLine(raw.safeExcerpt, MAX_EXCERPT),
    weakTopics: cleanWeakTopics(
      Array.isArray(raw.weakTopics)
        ? raw.weakTopics.filter((t): t is string => typeof t === "string")
        : undefined,
    ),
    strongTopics: cleanWeakTopics(
      Array.isArray(raw.strongTopics)
        ? raw.strongTopics.filter((t): t is string => typeof t === "string")
        : undefined,
    ),
    userDraft,
  };

  return { context, strippedKeys, draftAllowed };
}

export function isAIMentorSourceType(v: string): v is AIMentorSourceType {
  return (
    v === "lesson" ||
    v === "test_result" ||
    v === "practice" ||
    v === "dashboard" ||
    v === "general"
  );
}

export function mentorSurfaceToSourceType(surface: MentorSurface): AIMentorSourceType {
  switch (surface) {
    case "lesson":
      return "lesson";
    case "practice":
      return "practice";
    case "test_result":
      return "test_result";
    case "dashboard":
      return "dashboard";
    default:
      return "general";
  }
}

export function sourceTypeToMentorContextKind(
  sourceType: AIMentorSourceType,
): "lesson" | "practice" | "test" | "module" | "general" {
  switch (sourceType) {
    case "lesson":
      return "lesson";
    case "practice":
      return "practice";
    case "test_result":
      return "test";
    case "dashboard":
      return "module";
    default:
      return "general";
  }
}

/** Сборка канонического контекста на сервере (доверенные поля после загрузки из БД). */
export function mapServerToAIMentorContext(input: MapAIMentorContextServerInput): AIMentorContext {
  return sanitizeAIMentorContextInput(
    {
      sourceType: input.sourceType,
      sourceId: input.sourceId ?? undefined,
      moduleTitle: input.moduleTitle ?? undefined,
      lessonTitle: input.lessonTitle ?? undefined,
      practiceTitle: input.practiceTitle ?? undefined,
      testTitle: input.testTitle ?? undefined,
      safeTopic: input.safeTopic ?? undefined,
      safeExcerpt: input.safeExcerpt ?? undefined,
      weakTopics: input.weakTopics ?? undefined,
      strongTopics: input.strongTopics ?? undefined,
      userDraft: input.userDraft ?? undefined,
      locale: input.locale ?? AI_MENTOR_LOCALE,
    },
    { allowUserDraft: input.allowUserDraft, defaultSourceType: input.sourceType },
  ).context;
}

/** Минимальные подписи для UI chips (legacy MentorContextLabels). */
export function aiMentorContextToDisplayLabels(ctx: AIMentorContext): {
  moduleTitle?: string;
  lessonTitle?: string;
  taskTitle?: string;
  topic?: string;
  testSummary?: string;
} {
  const labels: {
    moduleTitle?: string;
    lessonTitle?: string;
    taskTitle?: string;
    topic?: string;
    testSummary?: string;
  } = {};
  if (ctx.moduleTitle) labels.moduleTitle = ctx.moduleTitle;
  if (ctx.lessonTitle) labels.lessonTitle = ctx.lessonTitle;
  if (ctx.practiceTitle) labels.taskTitle = ctx.practiceTitle;
  if (ctx.safeTopic) labels.topic = ctx.safeTopic;
  if (ctx.testTitle && ctx.sourceType === "test_result") {
    labels.testSummary = ctx.testTitle;
  }
  return labels;
}

/** Разрешён ли userDraft для режима. */
export function isUserDraftAllowedForMode(
  mode: AIMentorMode | undefined,
  sourceType: AIMentorSourceType,
): boolean {
  if (sourceType !== "practice") return false;
  return mode === "improve_reasoning" || mode === "check_understanding";
}
