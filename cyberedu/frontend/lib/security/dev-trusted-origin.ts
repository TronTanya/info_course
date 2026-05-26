/** Локальная сеть / loopback на порту dev-сервера — один AUTH_URL в .env не покрывает все хосты. */
export function isDevTrustedAppOrigin(origin: string, port = "3100"): boolean {
  if (process.env.NODE_ENV === "production") return false;
  try {
    const u = new URL(origin);
    const p = u.port || (u.protocol === "https:" ? "443" : "80");
    if (p !== port) return false;
    const host = u.hostname;
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
    return false;
  } catch {
    return false;
  }
}

export function devTrustedOriginsForNext(): string[] {
  const extra = (process.env.DEV_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  return ["localhost", "127.0.0.1", "192.168.0.4", ...extra];
}
