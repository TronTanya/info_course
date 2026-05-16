export {
  buildContentSecurityPolicy,
  securityHeadersList,
  applySecurityHeaders,
  resolveCspMode,
  isProductionSecurity,
  getEnforceReadyCsp,
  type CspMode,
  type CspPolicyProfile,
} from "@/lib/security/headers";
export { verifyApiCsrf } from "@/lib/security/csrf";
export {
  stripControlChars,
  stripHtmlTags,
  sanitizePlainText,
  isSafeExternalHttpsUrl,
  escapeIlikePattern,
} from "@/lib/security/sanitize";
export {
  consumeRateLimit,
  consumeRateLimitAsync,
  consumeCompositeRateLimit,
  consumeScopedRateLimit,
  enforceRateLimit,
  getRateLimitResetAt,
  rateLimitSubject,
  RATE_LIMIT_POLICIES,
} from "@/lib/security/rate-limit";
export {
  isLoginLocked,
  recordFailedLogin,
  clearLoginAttempts,
  checkLoginRateLimit,
  checkCredentialsCallbackRateLimit,
} from "@/lib/security/login-attempts";
export {
  clientIpFromHeaders,
  clientIpFromRequest,
  isTrustedProxyEnabled,
  isValidClientIp,
} from "@/lib/security/request-ip";
export {
  securityAudit,
  securityLog,
  logSecurityEvent,
  logAdminSecurityEvent,
  normalizeAuditIp,
  type SecurityAuditInput,
  type LogSecurityEventInput,
  type AuditSeverity,
} from "@/lib/security/audit";
export { SECURITY_ACTIONS, type SecurityAction } from "@/lib/security/audit-actions";
export {
  moderateUserPrompt,
  moderateAiOutput,
  sanitizeChatHistory,
  type ChatHistoryItem,
} from "@/lib/security/ai-moderation";
export {
  withApiGuard,
  withAuthApiRoute,
  withPublicApiRoute,
  API_ROUTE_PUBLIC,
  parseJsonBody,
  type ApiGuardContext,
  type ApiGuardPublicContext,
  type ApiGuardOptions,
} from "@/lib/security/api-guard";
export {
  ROLES,
  roleHasPermission,
  sessionHasPermission,
  requireRole,
  type Permission,
} from "@/lib/security/rbac";
export {
  assertSafeUploadFilename,
  safeFileExtension,
  assertBinaryMatchesExtension,
  rejectExecutableMagic,
  FORBIDDEN_UPLOAD_EXTENSIONS,
} from "@/lib/security/upload-sandbox";
