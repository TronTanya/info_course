import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { consumeRateLimit } from "@/lib/rate-limit";
import { clientIpFromRequest } from "@/lib/request-ip";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "POST" && pathname === "/api/auth/callback/credentials") {
    const ip = clientIpFromRequest(request);
    if (!consumeRateLimit(`auth:credentials:${ip}`, 20, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Слишком много попыток входа. Подождите несколько минут." },
        { status: 429 },
      );
    }
  }

  if (pathname.startsWith("/api/ai/") && request.method === "POST") {
    const ip = clientIpFromRequest(request);
    if (!consumeRateLimit(`mw:ai:post:ip:${ip}`, 240, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Слишком много запросов к AI. Попробуйте позже." }, { status: 429 });
    }
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const role = token?.role as string | undefined;

  if (pathname.startsWith("/dev")) {
    if (process.env.NODE_ENV !== "development") {
      return new NextResponse(null, { status: 404 });
    }
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "ADMIN") {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
    if (token) {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (pathname.startsWith("/auth/login")) {
        const cb = request.nextUrl.searchParams.get("callbackUrl");
        if (cb && cb.startsWith("/") && !cb.startsWith("//") && !cb.startsWith("/admin")) {
          return NextResponse.redirect(new URL(cb, request.url));
        }
      }
      return NextResponse.redirect(new URL("/dashboard/profile", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/dev/:path*",
    "/auth/login",
    "/auth/register",
    "/api/auth/callback/credentials",
    "/api/ai/:path*",
  ],
};
