/**
 * IP клиента с учётом доверенного reverse proxy.
 * X-Forwarded-For / X-Real-IP учитываются только при TRUSTED_PROXY=1|true.
 */

const IPV4_RE =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

/** Упрощённая проверка IPv6 (включая ::1 и mapped). */
const IPV6_RE =
  /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$|^::1$|^::$|^(?:[0-9a-fA-F]{0,4}:)*::[0-9a-fA-F]{0,4}$/;

export function isTrustedProxyEnabled(): boolean {
  const v = (process.env.TRUSTED_PROXY ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function isValidClientIp(ip: string): boolean {
  const s = ip.trim();
  if (!s || s.length > 64) return false;
  if (s.startsWith("[") && s.endsWith("]")) {
    return IPV6_RE.test(s.slice(1, -1));
  }
  return IPV4_RE.test(s) || IPV6_RE.test(s);
}

function parseForwardedFor(xff: string): string | null {
  const first = xff.split(",")[0]?.trim();
  if (!first) return null;
  const candidate = first.startsWith("[") ? first : first.split("%")[0] ?? first;
  return isValidClientIp(candidate) ? candidate.slice(0, 64) : null;
}

export function clientIpFromHeaders(h: Headers): string {
  if (isTrustedProxyEnabled()) {
    const xff = h.get("x-forwarded-for");
    if (xff) {
      const ip = parseForwardedFor(xff);
      if (ip) return ip;
    }
    const real = h.get("x-real-ip")?.trim();
    if (real && isValidClientIp(real)) return real.slice(0, 64);
    const cf = h.get("cf-connecting-ip")?.trim();
    if (cf && isValidClientIp(cf)) return cf.slice(0, 64);
  }

  return "direct";
}

export function clientIpFromRequest(req: Request): string {
  return clientIpFromHeaders(req.headers);
}
