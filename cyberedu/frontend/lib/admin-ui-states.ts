/**
 * Тексты и санитизация для UI админки — без stack trace, raw DB и секретов env.
 */

export type AdminEmptyKind =
  | "no_students"
  | "no_practices"
  | "no_certificates"
  | "no_ready_to_issue"
  | "no_audit";

export type AdminLoadErrorKind = "dashboard" | "review_queue";

export const ADMIN_EMPTY_COPY: Record<
  AdminEmptyKind,
  { title: string; description: string; terminalLine: string }
> = {
  no_students: {
    terminalLine: "students --empty",
    title: "Студентов пока нет",
    description: "Учётные записи с ролью студента появятся после регистрации на платформе.",
  },
  no_practices: {
    terminalLine: "queue --empty",
    title: "Нет практик на проверке",
    description: "Новые отправки появятся после сдачи практических заданий студентами.",
  },
  no_certificates: {
    terminalLine: "certificates --empty",
    title: "Сертификатов пока нет",
    description: "Записи появятся в реестре после выдачи студентам, завершившим курс.",
  },
  no_ready_to_issue: {
    terminalLine: "certificates --queue empty",
    title: "Нет студентов, готовых к выдаче",
    description:
      "Сейчас никто не завершил курс без записи в реестре. Измените фильтр или проверьте прогресс студентов.",
  },
  no_audit: {
    terminalLine: "audit --empty",
    title: "Событий аудита нет",
    description:
      "Журнал заполняется при действиях в системе. Если аудит отключён, включите SECURITY_AUDIT_DB.",
  },
};

export const ADMIN_LOAD_ERROR_COPY: Record<
  AdminLoadErrorKind,
  { title: string; description: string; terminalLine: string }
> = {
  dashboard: {
    terminalLine: "admin --load failed",
    title: "Не удалось загрузить панель",
    description:
      "Данные обзора временно недоступны. Обновите страницу или вернитесь позже. Технические детали скрыты.",
  },
  review_queue: {
    terminalLine: "queue --load failed",
    title: "Не удалось загрузить очередь практик",
    description:
      "Список работ на проверке не загрузился. Остальные разделы админки могут быть доступны.",
  },
};

export const ADMIN_ACTION_ERROR_FALLBACK =
  "Не удалось выполнить действие. Повторите попытку или обратитесь к администратору платформы.";

const FORBIDDEN_ACTION_SUBSTRINGS = [
  "prisma",
  "postgres",
  "postgresql",
  "mysql",
  "sqlite",
  "connection",
  "connect econnrefused",
  "p1001",
  "p2002",
  "unique constraint",
  "stack",
  "at /",
  "node_modules",
  "database_url",
  "redis_url",
  "secret",
  "api_key",
  "apikey",
  "passwordhash",
  "nextauth_secret",
  "openai",
  "bearer ",
  "authorization:",
] as const;

/** Безопасный код для логов (не для UI). */
export function adminSafeErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 120);
  }
  return undefined;
}

/**
 * Сообщение из server action / формы — только если оно не похоже на утечку инфраструктуры.
 */
export function sanitizeAdminActionError(raw: string | undefined | null): string {
  if (!raw?.trim()) return ADMIN_ACTION_ERROR_FALLBACK;
  const msg = raw.trim();
  const lower = msg.toLowerCase();
  if (msg.length > 280) return ADMIN_ACTION_ERROR_FALLBACK;
  for (const needle of FORBIDDEN_ACTION_SUBSTRINGS) {
    if (lower.includes(needle)) return ADMIN_ACTION_ERROR_FALLBACK;
  }
  return msg;
}

/** Digest Next.js для блока ref (не stack). */
export function adminSafeDigestRef(digest: string | undefined): string | undefined {
  if (!digest?.trim()) return undefined;
  const d = digest.trim();
  if (d.length > 64) return d.slice(0, 64);
  return d;
}
