/**
 * Санитизация пользовательского ввода: XSS-поверхности в HTML, управляющие символы, SSRF для URL.
 */

const CONTROL_CHARS = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;

/** Удаляет управляющие символы (кроме \t \n \r). Снижает log injection и странные bypass в валидаторах. */
export function stripControlChars(input: string): string {
  return input.replace(CONTROL_CHARS, "");
}

/** Простое удаление HTML-тегов (не полноценный DOMPurify — для plain-text полей). */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

export function sanitizePlainText(input: string, maxLen: number): string {
  return stripControlChars(stripHtmlTags(input)).trim().slice(0, maxLen);
}

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "169.254.169.254",
]);

/**
 * Проверка внешних URL из профиля (аватар https).
 * Предотвращает SSRF, если URL когда-либо запрашивается сервером.
 */
export function isSafeExternalHttpsUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host)) return false;
  if (host.endsWith(".local") || host.endsWith(".internal")) return false;
  // Private IPv4 ranges
  if (/^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) {
    return false;
  }
  return true;
}

/** Экранирование % и _ для безопасного ILIKE (если понадобится в raw SQL). */
export function escapeIlikePattern(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
