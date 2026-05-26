const DEFAULT_CALLBACK = "/dashboard/profile";

/** Относительный путь после auth; блокируем open-redirect и /admin для USER. */
export function safeCallbackUrl(raw: string | null | undefined, fallback = DEFAULT_CALLBACK): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw.startsWith("/admin")) return fallback;
  return raw;
}
