import type { NextRequest } from "next/server";
import { checkCredentialsCallbackRateLimit } from "@/lib/security/login-attempts";
import { clientIpFromRequest } from "@/lib/security/request-ip";

const CREDENTIALS_CALLBACK_PATH = "/api/auth/callback/credentials";

export type MiddlewareRateLimitBlock = {
  status: 429;
  body: { error: string };
};

/**
 * Единственный rate limit в middleware: NextAuth credentials callback (по IP).
 * AI, admin API, cert verify — только в Route Handlers / pages (withApiGuard, enforceRateLimit).
 */
export async function applyMiddlewareRateLimit(
  request: NextRequest,
): Promise<MiddlewareRateLimitBlock | null> {
  const { pathname } = request.nextUrl;
  if (request.method !== "POST" || pathname !== CREDENTIALS_CALLBACK_PATH) {
    return null;
  }

  const ip = clientIpFromRequest(request);
  const rl = await checkCredentialsCallbackRateLimit(ip);
  if (rl.ok) return null;

  return {
    status: 429,
    body: { error: "Слишком много попыток входа. Подождите несколько минут." },
  };
}
