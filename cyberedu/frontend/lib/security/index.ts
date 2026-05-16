export { buildContentSecurityPolicy, securityHeadersList, applySecurityHeaders } from "@/lib/security/headers";
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
  getRateLimitResetAt,
} from "@/lib/security/rate-limit";
export {
  isLoginLocked,
  recordFailedLogin,
  clearLoginAttempts,
  checkLoginRateLimit,
} from "@/lib/security/login-attempts";
export { securityAudit, securityLog, type SecurityAuditInput, type AuditSeverity } from "@/lib/security/audit";
export {
  moderateUserPrompt,
  moderateAiOutput,
  sanitizeChatHistory,
  type ChatHistoryItem,
} from "@/lib/security/ai-moderation";
export { withApiGuard, parseJsonBody, type ApiGuardContext, type ApiGuardOptions } from "@/lib/security/api-guard";
export {
  ROLES,
  roleHasPermission,
  sessionHasPermission,
  requireRole,
  type Permission,
} from "@/lib/security/rbac";
export { clientIpFromHeaders, clientIpFromRequest } from "@/lib/security/request-ip";
export {
  assertSafeUploadFilename,
  safeFileExtension,
  assertBinaryMatchesExtension,
  rejectExecutableMagic,
  FORBIDDEN_UPLOAD_EXTENSIONS,
} from "@/lib/security/upload-sandbox";
