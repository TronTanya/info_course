/**
 * IP клиента с учётом доверенного reverse proxy.
 * TRUSTED_PROXY=1 — брать первый IP из X-Forwarded-For (типично за nginx/traefik).
 * Иначе — только прямое соединение (защита от подмены XFF без прокси).
 */

function parseForwardedFor(xff: string): string | null {
  const first = xff.split(",")[0]?.trim();
  return first ? first.slice(0, 64) : null;
}

export function clientIpFromHeaders(h: Headers): string {
  const trustProxy = process.env.TRUSTED_PROXY === "1" || process.env.TRUSTED_PROXY === "true";

  if (trustProxy) {
    const xff = h.get("x-forwarded-for");
    if (xff) {
      const ip = parseForwardedFor(xff);
      if (ip) return ip;
    }
    const real = h.get("x-real-ip")?.trim();
    if (real) return real.slice(0, 64);
  }

  const cf = h.get("cf-connecting-ip")?.trim();
  if (cf && trustProxy) return cf.slice(0, 64);

  return "direct";
}

export function clientIpFromRequest(req: Request): string {
  return clientIpFromHeaders(req.headers);
}
