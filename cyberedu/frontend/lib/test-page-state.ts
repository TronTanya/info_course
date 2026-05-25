/** Безопасные тексты и классификация ошибок страницы теста (без stack trace и id в UI). */

export { TEST_ATTEMPTS_EXHAUSTED_MESSAGE } from "@/lib/test-retry";

export type TestPageLoadErrorKind = "load" | "progress" | "access";

export type TestPageEmptyKind = "module_not_found" | "test_not_found" | "no_questions";

export type TestClientErrorKind = "submit" | "access" | "load" | "generic";

export const TEST_LOCKED_DEFAULT_REASON =
  "Завершите уроки модуля, чтобы открыть тест.";

export const TEST_CLIENT_ERROR_FALLBACK: Record<TestClientErrorKind, string> = {
  submit: "Не удалось отправить тест. Проверьте соединение и попробуйте снова.",
  access: "Действие недоступно. Проверьте вход и порядок прохождения модуля.",
  load: "Не удалось загрузить тест. Обновите страницу.",
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
  /digest/i,
];

export function classifyTestClientError(message: string): TestClientErrorKind {
  const m = message.toLowerCase();
  if (
    m.includes("требуется вход") ||
    m.includes("авториз") ||
    m.includes("unauthorized") ||
    m.includes("недоступен") ||
    m.includes("сначала") ||
    m.includes("завершите") ||
    m.includes("доступ")
  ) {
    return "access";
  }
  if (
    m.includes("отправ") ||
    m.includes("submit") ||
    m.includes("попыток") ||
    m.includes("слишком много")
  ) {
    return "submit";
  }
  if (m.includes("загруз") || m.includes("не найден")) {
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

export function sanitizeTestUserMessage(
  raw: string | null | undefined,
  kind?: TestClientErrorKind,
): string {
  const trimmed = raw?.trim() ?? "";
  const resolvedKind = kind ?? (trimmed ? classifyTestClientError(trimmed) : "generic");

  if (!trimmed) {
    return TEST_CLIENT_ERROR_FALLBACK[resolvedKind];
  }

  if (looksTechnical(trimmed)) {
    return TEST_CLIENT_ERROR_FALLBACK[resolvedKind];
  }

  const msg = trimmed
    .split("\n")[0]
    ?.replace(UUID_RE, "")
    .replace(CUID_RE, "")
    .replace(/\s{2,}/g, " ")
    .trim() ?? "";

  if (!msg || msg.length < 4 || looksTechnical(msg)) {
    return TEST_CLIENT_ERROR_FALLBACK[resolvedKind];
  }

  return msg.length > 280 ? `${msg.slice(0, 277)}…` : msg;
}

export function resolveTestClientErrorDisplay(raw: string | null | undefined): {
  kind: TestClientErrorKind;
  message: string;
} {
  const kind = classifyTestClientError(raw ?? "");
  return {
    kind,
    message: sanitizeTestUserMessage(raw, kind),
  };
}

/** Понятная причина блокировки теста по коду gate (без внутренних id). */
export function testGateLockedReason(code: string, fallbackMessage: string): string {
  switch (code) {
    case "LESSON":
      return "Сначала изучите лекцию модуля, чтобы открыть тест.";
    case "VIDEO":
      return "Сначала просмотрите видео к лекции, затем вернитесь к тесту.";
    case "MODULE_LOCKED":
    case "MODULE_INACTIVE":
      return TEST_LOCKED_DEFAULT_REASON;
    default:
      return sanitizeTestUserMessage(fallbackMessage, "access");
  }
}
