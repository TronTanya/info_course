import type { RateLimitDenyReason } from "@/lib/security/rate-limit-service";
import { RATE_LIMIT_POLICIES } from "@/lib/security/rate-limit-service";

/** Сообщение для UI AI-наставника при 429 (без чисел и TTL). */
export const AI_MENTOR_RATE_LIMIT_MESSAGE =
  "Слишком много запросов к AI-наставнику. Подождите немного и попробуйте снова.";

export const API_RATE_LIMIT_MESSAGE_GENERIC = "Слишком много запросов. Попробуйте позже.";

/** Без упоминания Redis / инфраструктуры. */
export const API_RATE_LIMIT_MESSAGE_UNAVAILABLE =
  "Сервис временно недоступен. Попробуйте позже.";

const AI_RATE_LIMIT_KEYS = new Set<keyof typeof RATE_LIMIT_POLICIES>(["aiChat", "aiLessonAdapt"]);

export function isAiRateLimitPolicyKey(
  key: keyof typeof RATE_LIMIT_POLICIES | string,
): key is "aiChat" | "aiLessonAdapt" {
  return AI_RATE_LIMIT_KEYS.has(key as keyof typeof RATE_LIMIT_POLICIES);
}

const AI_MENTOR_RATE_LIMIT_UNAVAILABLE =
  "AI-наставник временно недоступен. Попробуйте позже.";

export function resolveApiRateLimitMessage(
  rateLimitKey: keyof typeof RATE_LIMIT_POLICIES | string,
  reason: RateLimitDenyReason,
): string {
  if (isAiRateLimitPolicyKey(rateLimitKey)) {
    return reason === "unavailable" ? AI_MENTOR_RATE_LIMIT_UNAVAILABLE : AI_MENTOR_RATE_LIMIT_MESSAGE;
  }
  if (reason === "unavailable") return API_RATE_LIMIT_MESSAGE_UNAVAILABLE;
  return API_RATE_LIMIT_MESSAGE_GENERIC;
}
