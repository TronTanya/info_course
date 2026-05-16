/** IP клиента из заголовков прокси (best-effort). */
export function clientIpFromHeaders(h: Headers): string {
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = h.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  return "unknown";
}

export function clientIpFromRequest(req: Request): string {
  return clientIpFromHeaders(req.headers);
}
