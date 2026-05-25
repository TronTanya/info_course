import { enforceRateLimit, RATE_LIMIT_POLICIES } from "@/lib/security/rate-limit";
import type { RateLimitResult } from "@/lib/security/rate-limit-service";

export { isAiRateLimitPolicyKey } from "@/lib/security/rate-limit-messages";

/**
 * AI API: лимит по пользователю (основной) и по IP (дополнительно, как у auth/register).
 * Redis через `enforceRateLimit`; в production без Redis — fail-closed.
 */
export async function enforceAiMentorApiRateLimit(opts: {
  userId: string;
  clientIp: string;
}): Promise<RateLimitResult> {
  const userPolicy = RATE_LIMIT_POLICIES.aiChat;
  const userRl = await enforceRateLimit({
    scope: userPolicy.scope,
    userId: opts.userId,
    clientIp: opts.clientIp,
    max: userPolicy.max,
    windowMs: userPolicy.windowMs,
  });
  if (!userRl.allowed) return userRl;

  const ipPolicy = RATE_LIMIT_POLICIES.aiChatIp;
  return enforceRateLimit({
    scope: ipPolicy.scope,
    clientIp: opts.clientIp,
    max: ipPolicy.max,
    windowMs: ipPolicy.windowMs,
  });
}
