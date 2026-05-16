import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { applySecurityHeaders } from "@/lib/security/headers";
import { verifyApiCsrf } from "@/lib/security/csrf";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { clientIpFromRequest } from "@/lib/security/request-ip";

function withSecurityHeaders(res: NextResponse): NextResponse {
  return applySecurityHeaders(res);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = clientIpFromRequest(request);

  // --- CSRF для mutating API (дополнение к Server Actions) ---
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const csrf = verifyApiCsrf(request);
    if (!csrf.ok) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Запрос отклонён (CSRF)." }, { status: 403 }),
      );
    }
  }

  // --- Brute force: callback credentials ---
  if (request.method === "POST" && pathname === "/api/auth/callback/credentials") {
    if (!consumeRateLimit(`auth:credentials:${ip}`, 20, 15 * 60 * 1000)) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: "Слишком много попыток входа. Подождите несколько минут." },
          { status: 429 },
        ),
      );
    }
  }

  // --- Перебор кодов сертификата ---
  if (pathname.startsWith("/certificate/verify")) {
    if (!consumeRateLimit(`cert:verify:ip:${ip}`, 40, 15 * 60 * 1000)) {
      return withSecurityHeaders(new NextResponse("Слишком много запросов.", { status: 429 }));
    }
  }

  // --- Admin API: ранний rate limit ---
  if (pathname.startsWith("/api/admin/")) {
    if (!consumeRateLimit(`api:admin:ip:${ip}`, 60, 60 * 60 * 1000)) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Слишком много запросов." }, { status: 429 }),
      );
    }
  }

  // --- AI coarse limit (детальный — в route handlers) ---
  if (pathname.startsWith("/api/ai/") && request.method === "POST") {
    if (!consumeRateLimit(`mw:ai:post:ip:${ip}`, 120, 60 * 60 * 1000)) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Слишком много запросов к AI. Попробуйте позже." }, { status: 429 }),
      );
    }
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const role = token?.role as string | undefined;

  if (pathname.startsWith("/dev")) {
    if (process.env.NODE_ENV !== "development") {
      return withSecurityHeaders(new NextResponse(null, { status: 404 }));
    }
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("callbackUrl", pathname);
      return withSecurityHeaders(NextResponse.redirect(url));
    }
    if (role !== "ADMIN") {
      return withSecurityHeaders(new NextResponse(null, { status: 404 }));
    }
    return withSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("callbackUrl", pathname);
      return withSecurityHeaders(NextResponse.redirect(url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("callbackUrl", pathname);
      return withSecurityHeaders(NextResponse.redirect(url));
    }
    if (role !== "ADMIN") {
      return withSecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
    }
  }

  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
    if (token) {
      if (role === "ADMIN") {
        return withSecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
      }
      if (pathname.startsWith("/auth/login")) {
        const cb = request.nextUrl.searchParams.get("callbackUrl");
        if (cb && cb.startsWith("/") && !cb.startsWith("//") && !cb.startsWith("/admin")) {
          return withSecurityHeaders(NextResponse.redirect(new URL(cb, request.url)));
        }
      }
      return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard/profile", request.url)));
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/).*)",
    "/api/:path*",
  ],
};
