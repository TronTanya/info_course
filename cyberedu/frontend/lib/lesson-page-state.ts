/** Пустой или только пробелы / пустые fence-блоки. */
export function isLessonContentEmpty(content: string | null | undefined): boolean {
  if (!content?.trim()) return true;
  const withoutFences = content.replace(/:::[\w_]+\s*[\s\S]*?:::/g, "").trim();
  return withoutFences.length === 0;
}

export type LessonClientErrorKind = "progress_save" | "access" | "load" | "generic";

export type LessonSectionEmptyKind = "objectives" | "key_terms" | "checkpoint";

export const LESSON_SECTION_EMPTY: Record<
  LessonSectionEmptyKind,
  { title: string; message: string }
> = {
  objectives: {
    title: "Цели урока",
    message: "Цели урока будут добавлены позже.",
  },
  key_terms: {
    title: "Ключевые термины",
    message: "Ключевые термины будут добавлены позже.",
  },
  checkpoint: {
    title: "Самопроверка",
    message: "Самопроверка появится после обновления урока.",
  },
};

export const LESSON_CLIENT_ERROR_FALLBACK: Record<LessonClientErrorKind, string> = {
  progress_save: "Не удалось сохранить прогресс. Повторите попытку или обновите страницу.",
  access: "Действие недоступно. Проверьте вход и порядок прохождения модуля.",
  load: "Не удалось загрузить данные урока. Обновите страницу.",
  generic: "Не удалось выполнить действие. Попробуйте позже.",
};

const UUID_RE =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
const CUID_RE = /\bc[a-z0-9]{20,}\b/gi;

const TECHNICAL_PATTERNS = [
  /prisma/i,
  /unique constraint/i,
  /\bP\d{4}\b/,
  /invalid `.+` invocation/i,
  /\bat\s+[\w./]+:\d+/i,
  /stack\s*trace/i,
  /ECONNREFUSED/i,
  /SQLITE_/i,
  /postgres/i,
  /database/i,
  /internal server/i,
  /unexpected token/i,
  /SyntaxError/i,
  /TypeError:/i,
];

/** Классификация сообщений server actions / клиента (без показа stack trace). */
export function classifyLessonClientError(message: string): LessonClientErrorKind {
  const m = message.toLowerCase();
  if (
    m.includes("вход") ||
    m.includes("авториз") ||
    m.includes("недоступен") ||
    m.includes("заблок") ||
    m.includes("сначала") ||
    m.includes("доступ")
  ) {
    return "access";
  }
  if (m.includes("прогресс") || m.includes("сохран")) {
    return "progress_save";
  }
  if (m.includes("загруз") || m.includes("не удалось выполнить")) {
    return "load";
  }
  return "generic";
}

function looksTechnical(message: string): boolean {
  if (TECHNICAL_PATTERNS.some((p) => p.test(message))) return true;
  if (/\n\s+at\s+/m.test(message)) return true;
  if (message.includes(" at ") && /:\d+/.test(message)) return true;
  return false;
}

/**
 * Безопасный текст для UI: без UUID/cuid, stack trace и сообщений БД.
 */
export function sanitizeLessonUserMessage(
  raw: string | null | undefined,
  kind?: LessonClientErrorKind,
): string {
  const trimmed = raw?.trim() ?? "";
  const resolvedKind = kind ?? (trimmed ? classifyLessonClientError(trimmed) : "generic");

  if (!trimmed) {
    return LESSON_CLIENT_ERROR_FALLBACK[resolvedKind];
  }

  if (looksTechnical(trimmed)) {
    return LESSON_CLIENT_ERROR_FALLBACK[resolvedKind];
  }

  const msg = trimmed
    .split("\n")[0]
    ?.replace(UUID_RE, "")
    .replace(CUID_RE, "")
    .replace(/\s{2,}/g, " ")
    .trim() ?? "";

  if (!msg || msg.length < 4 || looksTechnical(msg)) {
    return LESSON_CLIENT_ERROR_FALLBACK[resolvedKind];
  }

  return msg.length > 280 ? `${msg.slice(0, 277)}…` : msg;
}

export function resolveLessonClientErrorDisplay(raw: string | null | undefined): {
  kind: LessonClientErrorKind;
  message: string;
} {
  const kind = classifyLessonClientError(raw ?? "");
  return {
    kind,
    message: sanitizeLessonUserMessage(raw, kind),
  };
}
