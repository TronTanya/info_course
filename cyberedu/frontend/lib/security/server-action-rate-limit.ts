import { headers } from "next/headers";
import { enforceRateLimit, RATE_LIMIT_POLICIES } from "@/lib/security/rate-limit";
import { clientIpFromHeaders } from "@/lib/security/request-ip";

export type ServerActionRateLimitKey =
  | "testSubmit"
  | "practiceText"
  | "practiceInteractive"
  | "practiceStructured";

const DEFAULT_EXCEEDED = "Слишком много отправок. Подождите и попробуйте позже.";
const DEFAULT_UNAVAILABLE =
  "Сервис временно недоступен. Повторите попытку через несколько минут.";

export type ServerActionRateLimitMessages = {
  exceeded?: string;
  unavailable?: string;
};

/**
 * Redis-backed rate limit for Server Actions (production fail-closed without REDIS_URL).
 */
export async function enforceServerActionRateLimit(
  key: ServerActionRateLimitKey,
  userId: string,
  messages?: ServerActionRateLimitMessages,
): Promise<{ allowed: true } | { allowed: false; error: string }> {
  const h = await headers();
  const ip = clientIpFromHeaders(h);
  const policy = RATE_LIMIT_POLICIES[key];

  const rl = await enforceRateLimit({
    scope: policy.scope,
    userId,
    clientIp: ip,
    max: policy.max,
    windowMs: policy.windowMs,
  });

  if (rl.allowed) return { allowed: true };

  const error =
    rl.reason === "unavailable"
      ? (messages?.unavailable ?? DEFAULT_UNAVAILABLE)
      : (messages?.exceeded ?? DEFAULT_EXCEEDED);

  return { allowed: false, error };
}
