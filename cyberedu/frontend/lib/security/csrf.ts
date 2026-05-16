import type { NextRequest } from "next/server";

function expectedOrigin(req: NextRequest): string | null {
  const explicit =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim();
  if (explicit) {
    try {
      return new URL(explicit).origin;
    } catch {
      return null;
    }
  }
  return req.nextUrl.origin;
}

/**
 * Проверка Origin/Referer для state-changing API-запросов.
 * Дополняет встроенную защиту Server Actions в Next.js (Origin check).
 * Блокирует cross-site POST с браузера жертвы (CSRF).
 */
export function verifyApiCsrf(req: NextRequest): { ok: true } | { ok: false; reason: string } {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return { ok: true };
  }

  const expected = expectedOrigin(req);
  if (!expected) {
    return { ok: false, reason: "origin_not_configured" };
  }

  const origin = req.headers.get("origin");
  if (origin) {
    if (origin === expected) return { ok: true };
    return { ok: false, reason: "origin_mismatch" };
  }

  const referer = req.headers.get("referer");
  if (referer) {
    try {
      if (new URL(referer).origin === expected) return { ok: true };
    } catch {
      return { ok: false, reason: "invalid_referer" };
    }
    return { ok: false, reason: "referer_mismatch" };
  }

  // Same-origin fetch из браузера обычно шлёт Origin; отсутствие — подозрительно для API
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return { ok: false, reason: "missing_origin" };
  }

  return { ok: true };
}
