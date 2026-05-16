import type { NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

function appOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    "http://localhost:3100";
  return raw.replace(/\/$/, "");
}

function apiConnectOrigins(): string[] {
  const out = new Set<string>(["'self'"]);
  const app = appOrigin();
  try {
    out.add(new URL(app).origin);
  } catch {
    /* ignore */
  }
  const api = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (api) {
    try {
      out.add(new URL(api).origin);
    } catch {
      /* ignore */
    }
  }
  const aiBase = process.env.OPENAI_API_BASE_URL?.trim() || "https://api.openai.com/v1";
  try {
    out.add(new URL(aiBase).origin);
  } catch {
    out.add("https://api.openai.com");
  }
  return [...out];
}

/**
 * Content-Security-Policy (Helmet-style для Next.js).
 * В dev разрешён unsafe-eval для React Refresh; в production — строже.
 */
export function buildContentSecurityPolicy(): string {
  const connect = apiConnectOrigins().join(" ");
  const scriptSrc = isProd ? "'self' 'unsafe-inline'" : "'self' 'unsafe-inline' 'unsafe-eval'";
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${connect}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** Security headers (аналог Helmet) для всех ответов приложения. */
export function securityHeadersList(): { key: string; value: string }[] {
  const headers: { key: string; value: string }[] = [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy() },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  ];

  if (isProd) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}

export function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const { key, value } of securityHeadersList()) {
    response.headers.set(key, value);
  }
  return response;
}
