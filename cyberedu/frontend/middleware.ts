import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { applySecurityHeaders } from "@/lib/security/headers";
import { verifyApiCsrf } from "@/lib/security/csrf";
import { isProductionRuntime } from "@/lib/security/rate-limit-service";
function withSecurityHeaders(res: NextResponse): NextResponse {
  return applySecurityHeaders(res);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProductionRuntime() && pathname.startsWith("/api/dev/")) {
    return withSecurityHeaders(NextResponse.json({ error: "not_found" }, { status: 404 }));
  }

  // Dev: localhost и 127.0.0.1 — разные хосты для cookie; NextAuth сессия «теряется» на 127.0.0.1.
  if (
    process.env.NODE_ENV !== "production" &&
    request.nextUrl.hostname === "127.0.0.1" &&
    request.nextUrl.port === "3100"
  ) {
    const url = request.nextUrl.clone();
    url.hostname = "localhost";
    return withSecurityHeaders(NextResponse.redirect(url));
  }

  // Rate limits: credentials callback — в authorize() (Node.js + Redis). AI / admin / cert — Route Handlers.

  // --- CSRF для mutating API (дополнение к Server Actions) ---
  const devAuthBypass =
    process.env.NODE_ENV !== "production" &&
    (pathname === "/api/dev/e2e-reset-auth" || pathname === "/api/dev/reset-demo-passwords");
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/") && !devAuthBypass) {
    const csrf = verifyApiCsrf(request);
    if (!csrf.ok) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Запрос отклонён (CSRF)." }, { status: 403 }),
      );
    }
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const role = token?.role as string | undefined;
  const emailVerified = Boolean((token as { emailVerifiedAt?: string | null } | null)?.emailVerifiedAt);

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
    if (role === "USER" && !emailVerified) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/verify-email";
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

  const isAuthEntry =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register") ||
    pathname.startsWith("/auth/forgot-password") ||
    pathname.startsWith("/auth/reset-password") ||
    pathname.startsWith("/auth/verify-email");

  if (isAuthEntry) {
    if (token) {
      if (pathname.startsWith("/auth/verify-email")) {
        return withSecurityHeaders(NextResponse.next());
      }
      if (role === "USER" && !emailVerified) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/verify-email";
        return withSecurityHeaders(NextResponse.redirect(url));
      }
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
