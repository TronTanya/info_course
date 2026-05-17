/**
 * @deprecated Импортируйте из `@/lib/security/rate-limit`.
 * Server Actions: `enforceServerActionRateLimit` из `@/lib/security/server-action-rate-limit`.
 */
export {
  consumeRateLimitAsync,
  consumeCompositeRateLimit,
  getRateLimitResetAt,
  enforceRateLimit,
} from "@/lib/security/rate-limit";
