import { headers } from "next/headers";
import type { Session } from "next-auth";
import { requireAdmin } from "@/lib/permissions";
import { enforceRateLimit, RATE_LIMIT_POLICIES } from "@/lib/security/rate-limit";
import { clientIpFromHeaders } from "@/lib/security/request-ip";

const DEFAULT_EXCEEDED =
  "Слишком много административных операций. Подождите и попробуйте позже.";
const DEFAULT_UNAVAILABLE =
  "Сервис временно недоступен. Повторите попытку через несколько минут.";

/**
 * Admin Server Actions: роль из БД (см. requireAdmin) + Redis rate limit.
 */
export async function requireAdminAction(): Promise<Session> {
  const session = await requireAdmin();
  const h = await headers();
  const ip = clientIpFromHeaders(h);
  const policy = RATE_LIMIT_POLICIES.adminMutation;

  const rl = await enforceRateLimit({
    scope: policy.scope,
    userId: session.user.id,
    clientIp: ip,
    max: policy.max,
    windowMs: policy.windowMs,
  });

  if (rl.allowed) return session;

  const message =
    rl.reason === "unavailable" ? DEFAULT_UNAVAILABLE : DEFAULT_EXCEEDED;
  throw new Error(message);
}
