/** Безопасные тексты и классификация ошибок страницы практики (без stack trace и id в UI). */

import { COURSE_PROGRESS_USER_MESSAGES } from "@/lib/course-progress-guards";

export type PracticePageLoadErrorKind = "load" | "progress" | "access";

export type PracticePageEmptyKind = "module_not_found" | "practice_not_found";

export type PracticeSectionEmptyKind = "scenario" | "evidence" | "instructions";

export type PracticeClientErrorKind = "submit" | "upload" | "access" | "load" | "generic";

export const PRACTICE_LOCKED_TEST_REASON = "Сначала сдайте тест модуля.";

export const PRACTICE_SECTION_EMPTY: Record<PracticeSectionEmptyKind, { title: string; message: string }> = {
  scenario: {
    title: "Сценарий",
    message: "Сценарий лаборатории будет добавлен позже.",
  },
  evidence: {
    title: "Артефакты",
    message: "Материалы для расследования появятся после публикации задания.",
  },
  instructions: {
    title: "Инструкции",
    message: "Инструкции к заданию будут добавлены позже.",
  },
};

export const PRACTICE_CLIENT_ERROR_FALLBACK: Record<PracticeClientErrorKind, string> = {
  submit: "Не удалось отправить ответ. Проверьте соединение и попробуйте снова.",
  upload: "Не удалось загрузить файл. Проверьте формат и размер, затем повторите.",
  access: "Действие недоступно. Проверьте вход и порядок прохождения модуля.",
  load: "Не удалось загрузить практику. Обновите страницу.",
  generic: "Не удалось выполнить действие. Попробуйте позже.",
};

const UUID_RE =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
const CUID_RE = /\bc[a-z0-9]{20,}\b/gi;

const STORAGE_PATH_RE = /(?:\/|\\)[\w.-]+\.(?:pdf|docx?|txt|zip|png|jpe?g|log|csv)/gi;

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
  /digest/i,
  /ENOENT/i,
  /privateStorage/i,
  /storagePath/i,
];

export function resolvePracticeLockedReason(code: string, fallback: string): string {
  switch (code) {
    case "TEST":
      return PRACTICE_LOCKED_TEST_REASON;
    case "LESSON":
      return COURSE_PROGRESS_USER_MESSAGES.LESSON_FIRST;
    case "VIDEO":
      return COURSE_PROGRESS_USER_MESSAGES.VIDEO_FIRST;
    case "MODULE_LOCKED":
      return COURSE_PROGRESS_USER_MESSAGES.PREVIOUS_MODULE;
    case "MODULE_INACTIVE":
      return COURSE_PROGRESS_USER_MESSAGES.MODULE_INACTIVE;
    default:
      return sanitizePracticeUserMessage(fallback, "access");
  }
}

export function classifyPracticeClientError(message: string): PracticeClientErrorKind {
  const m = message.toLowerCase();
  if (
    m.includes("требуется вход") ||
    m.includes("авториз") ||
    m.includes("unauthorized") ||
    m.includes("недоступен") ||
    m.includes("сначала") ||
    m.includes("заблок") ||
    m.includes("доступ")
  ) {
    return "access";
  }
  if (
    m.includes("upload") ||
    m.includes("файл") ||
    m.includes("multipart") ||
    (m.includes("загруз") && m.includes("файл"))
  ) {
    return "upload";
  }
  if (
    m.includes("отправ") ||
    m.includes("submit") ||
    m.includes("проверк") ||
    m.includes("слишком много")
  ) {
    return "submit";
  }
  if (m.includes("не удалось загрузить") || (m.includes("загруз") && m.includes("практик"))) {
    return "load";
  }
  return "generic";
}

function looksTechnical(message: string): boolean {
  if (TECHNICAL_PATTERNS.some((p) => p.test(message))) return true;
  if (STORAGE_PATH_RE.test(message)) return true;
  if (/\n\s+at\s+/m.test(message)) return true;
  if (message.includes(" at ") && /:\d+/.test(message)) return true;
  return false;
}

export function sanitizePracticeUserMessage(
  raw: string | null | undefined,
  kind?: PracticeClientErrorKind,
): string {
  const trimmed = raw?.trim() ?? "";
  const resolvedKind = kind ?? (trimmed ? classifyPracticeClientError(trimmed) : "generic");

  if (!trimmed) {
    return PRACTICE_CLIENT_ERROR_FALLBACK[resolvedKind];
  }

  if (looksTechnical(trimmed)) {
    return PRACTICE_CLIENT_ERROR_FALLBACK[resolvedKind];
  }

  const msg = trimmed
    .split("\n")[0]
    ?.replace(UUID_RE, "")
    .replace(CUID_RE, "")
    .replace(STORAGE_PATH_RE, "")
    .replace(/\s{2,}/g, " ")
    .trim() ?? "";

  if (!msg || msg.length < 4 || looksTechnical(msg)) {
    return PRACTICE_CLIENT_ERROR_FALLBACK[resolvedKind];
  }

  if (!/[а-яё]/i.test(msg) && /[a-z]/i.test(msg)) {
    return PRACTICE_CLIENT_ERROR_FALLBACK[resolvedKind];
  }

  return msg.length > 280 ? `${msg.slice(0, 277)}…` : msg;
}

export function resolvePracticeClientErrorDisplay(raw: string | null | undefined): {
  kind: PracticeClientErrorKind;
  message: string;
} {
  const kind = classifyPracticeClientError(raw ?? "");
  return {
    kind,
    message: sanitizePracticeUserMessage(raw, kind),
  };
}
