import type { NextResponse } from "next/server";

/** Как публиковать CSP: сначала report-only, затем `CSP_MODE=enforce`. */
export type CspMode = "off" | "report-only" | "enforce";

export type CspPolicyProfile = "report-only" | "enforce";

const PERMISSIONS_POLICY =
  "accelerometer=(), autoplay=(), camera=(), cross-origin-isolated=(), display-capture=(), " +
  "encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), " +
  "microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), " +
  "screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=()";

/**
 * Production security (HSTS, upgrade-insecure-requests, CSP default report-only).
 * Docker frontend: `ENVIRONMENT=production`; локально — `NODE_ENV=production`.
 */
export function isProductionSecurity(): boolean {
  const environment = (process.env.ENVIRONMENT ?? "").trim().toLowerCase();
  if (environment === "development" || environment === "dev") return false;
  if (environment === "production" || environment === "prod") return true;
  return process.env.NODE_ENV === "production";
}

/**
 * `CSP_MODE`: `off` | `report-only` | `enforce`.
 * По умолчанию: dev — `off`, production — `report-only` (безопасный rollout).
 */
export function resolveCspMode(): CspMode {
  const raw = (process.env.CSP_MODE ?? "").trim().toLowerCase();
  if (raw === "enforce" || raw === "on" || raw === "1") return "enforce";
  if (raw === "off" || raw === "none" || raw === "0" || raw === "false") return "off";
  if (raw === "report-only" || raw === "report_only" || raw === "report") return "report-only";
  return isProductionSecurity() ? "report-only" : "off";
}

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
 * Единая политика CSP для report-only и enforce (одинаковые директивы — проще сравнить отчёты).
 * Next.js: `unsafe-inline` для runtime chunks; dev — `unsafe-eval` (React Refresh).
 */
export function buildContentSecurityPolicy(profile: CspPolicyProfile = "enforce"): string {
  void profile;
  const prod = isProductionSecurity();
  const connect = apiConnectOrigins().join(" ");
  const scriptSrc = prod
    ? "'self' 'unsafe-inline'"
    : "'self' 'unsafe-inline' 'unsafe-eval'";

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src ${connect}`,
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ];

  if (prod) {
    directives.push("upgrade-insecure-requests");
  }

  const reportUri = process.env.CSP_REPORT_URI?.trim();
  if (reportUri) {
    directives.push(`report-uri ${reportUri}`);
  }

  return directives.join("; ");
}

/** Политика для переключения `CSP_MODE=enforce` (та же строка, что в report-only). */
export function getEnforceReadyCsp(): string {
  return buildContentSecurityPolicy("enforce");
}

function cspHeaderEntry(mode: CspMode): { key: string; value: string } | null {
  if (mode === "off") return null;
  const policy = buildContentSecurityPolicy(mode === "report-only" ? "report-only" : "enforce");
  if (mode === "report-only") {
    return { key: "Content-Security-Policy-Report-Only", value: policy };
  }
  return { key: "Content-Security-Policy", value: policy };
}

/** Security headers для всех ответов (`next.config.ts` + `middleware`). */
export function securityHeadersList(): { key: string; value: string }[] {
  const headers: { key: string; value: string }[] = [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
    { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-site" },
    { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  ];

  const csp = cspHeaderEntry(resolveCspMode());
  if (csp) headers.push(csp);

  if (isProductionSecurity()) {
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
