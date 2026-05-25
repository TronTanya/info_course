/**
 * Тексты и санитизация UI сертификатов — без stack trace, raw DB и внутренних ID в сообщениях.
 */

export type CertificateEmptyKind =
  | "not_available"
  | "not_issued_yet"
  | "admin_no_issued"
  | "admin_no_ready";

export type CertificateErrorKind = "load" | "issue" | "pdf_download" | "verify";

export const CERTIFICATE_EMPTY_COPY: Record<
  CertificateEmptyKind,
  { title: string; description: string; terminalLine: string }
> = {
  not_available: {
    terminalLine: "certificate --no-course",
    title: "Сертификат пока недоступен",
    description:
      "Программа курса ещё не настроена. Когда курс будет доступен, здесь появятся требования и выдача документа.",
  },
  not_issued_yet: {
    terminalLine: "certificate --pending",
    title: "Сертификат ещё не выдан",
    description:
      "Выполните все условия курса — после выдачи документ появится в этом разделе с номером реестра и ссылкой на проверку.",
  },
  admin_no_issued: {
    terminalLine: "registry --empty",
    title: "Выданных сертификатов нет",
    description: "В реестре пока нет записей. Студенты с завершённым курсом могут быть в очереди «Готовы к выдаче».",
  },
  admin_no_ready: {
    terminalLine: "queue --empty",
    title: "Нет студентов, готовых к выдаче",
    description:
      "Сейчас никто не завершил курс без записи в реестре. Проверьте прогресс студентов или фильтр поиска.",
  },
};

export const CERTIFICATE_ERROR_COPY: Record<
  CertificateErrorKind,
  { title: string; description: string; terminalLine: string }
> = {
  load: {
    terminalLine: "certificate --load failed",
    title: "Не удалось загрузить сертификат",
    description:
      "Данные раздела временно недоступны. Обновите страницу или зайдите позже. Технические детали скрыты.",
  },
  issue: {
    terminalLine: "certificate --issue failed",
    title: "Не удалось выдать сертификат",
    description:
      "Сервер не зарегистрировал документ. Убедитесь, что все условия курса выполнены, и повторите попытку.",
  },
  pdf_download: {
    terminalLine: "pdf --unavailable",
    title: "Не удалось скачать PDF",
    description:
      "Файл сертификата временно недоступен. Если документ только что выдан, обновите страницу через минуту.",
  },
  verify: {
    terminalLine: "verify --error",
    title: "Проверка временно недоступна",
    description:
      "Не удалось выполнить проверку. Повторите позже или введите номер сертификата вручную на странице проверки.",
  },
};

export const CERTIFICATE_UNAUTHORIZED_COPY = {
  terminalLine: "certificate --forbidden",
  title: "Нет доступа к документу",
  description:
    "Этот сертификат недоступен в вашем учебном кабинете. Скачивание и просмотр возможны только для вашего собственного документа.",
};

export const CERTIFICATE_PUBLIC_NOT_FOUND_COPY = {
  terminalLine: "verify --not-found",
  title: "Сертификат не найден",
  description:
    "Запись с указанным номером отсутствует в официальном реестре CyberEdu Academy. Проверьте код с QR или PDF и попробуйте снова.",
};

export const CERTIFICATE_ISSUE_ERROR_FALLBACK = CERTIFICATE_ERROR_COPY.issue.description;

const FORBIDDEN_USER_MESSAGE_SUBSTRINGS = [
  "prisma",
  "postgres",
  "postgresql",
  "sqlite",
  "connection",
  "econnrefused",
  "p1001",
  "p2002",
  "unique constraint",
  "stack",
  "at /",
  "node_modules",
  "database_url",
  "redis_url",
  "secret",
  "verificationcode",
  "verification_code",
  "nextauth",
  "openai",
  "certificateid",
  "user id",
  "userid",
] as const;

/** Сообщения для UI — только безопасные строки. */
export function sanitizeCertificateUserMessage(
  raw: string | undefined | null,
  fallback: string,
): string {
  if (!raw?.trim()) return fallback;
  const msg = raw.trim();
  if (msg.length > 280) return fallback;
  const lower = msg.toLowerCase();
  for (const needle of FORBIDDEN_USER_MESSAGE_SUBSTRINGS) {
    if (lower.includes(needle)) return fallback;
  }
  if (/^[a-f0-9-]{20,}$/i.test(msg)) return fallback;
  return msg;
}

export function certificateSafeDigestRef(digest: string | undefined): string | undefined {
  if (!digest?.trim()) return undefined;
  const d = digest.trim();
  return d.length > 64 ? d.slice(0, 64) : d;
}

export type CertificatePdfDownloadErrorKind = "pdf_download" | "unauthorized";

/** HTTP-статус скачивания PDF → тип ошибки для UI (без раскрытия чужих ID). */
export function mapCertificatePdfDownloadError(status: number): CertificatePdfDownloadErrorKind {
  if (status === 404) return "unauthorized";
  return "pdf_download";
}
