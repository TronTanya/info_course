/** Канонические action-ключи для SecurityAuditLog. */
export const SECURITY_ACTIONS = {
  AUTH_LOGIN_SUCCESS: "auth.login.success",
  AUTH_LOGIN_FAILED: "auth.login.failed",
  AUTH_LOGIN_LOCKED: "auth.login.locked",
  AUTH_LOGIN_RATE_LIMITED: "auth.login.rate_limited",

  ADMIN_USER_ROLE_CHANGE: "admin.user.role_change",
  ADMIN_USERS_CSV_EXPORT: "admin.users.csv_export",
  ADMIN_PRACTICE_REVIEW: "admin.practice.review",
  ADMIN_CONTENT_PUBLISH: "admin.content.publish",
  ADMIN_CONTENT_UNPUBLISH: "admin.content.unpublish",

  CERTIFICATE_GENERATE: "certificate.generate",
  CERTIFICATE_VERIFY_ABUSE: "certificate.verify.abuse",
  CERTIFICATE_VERIFY_FAILED: "certificate.verify.failed",

  AI_SAFETY_REFUSAL: "ai.safety.refusal",
  AI_SAFETY_OUTPUT_BLOCKED: "ai.safety.output_blocked",
  AI_SAFETY_CLIENT_HISTORY: "ai.safety.client_history_rejected",
} as const;

export type SecurityAction = (typeof SECURITY_ACTIONS)[keyof typeof SECURITY_ACTIONS];
