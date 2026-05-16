/**
 * @deprecated Импортируйте из `@/lib/security/rate-limit`.
 * Server Actions: `enforceServerActionRateLimit` из `@/lib/security/server-action-rate-limit`.
 * Sync `consumeRateLimit` — только dev in-memory; в production всегда deny.
 */
export {
  consumeRateLimit,
  consumeRateLimitAsync,
  consumeCompositeRateLimit,
  getRateLimitResetAt,
  enforceRateLimit,
} from "@/lib/security/rate-limit";
