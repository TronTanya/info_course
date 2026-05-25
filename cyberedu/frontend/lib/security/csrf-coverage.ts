/**
 * Карта CSRF-защиты state-changing операций (документация + контрактные тесты).
 *
 * Слои (без дублирования):
 * 1. Route Handlers `/api/*` — `verifyApiCsrf` в `middleware.ts` (Origin/Referer).
 * 2. Server Actions — встроенная проверка Origin в Next.js (cookie session).
 * 3. NextAuth `/api/auth/*` — CSRF token (`/api/auth/csrf`), middleware не дублирует.
 */

/** Префиксы API, исключённые из middleware Origin-check (свой CSRF). */
export const CSRF_API_AUTH_EXEMPT_PREFIX = "/api/auth/" as const;

/** Публичные mutating API без Origin (отдельные контроли). */
export const CSRF_API_EXEMPT_PATHS = ["/api/csp-report"] as const;

/** Mutating API, защищённые middleware (репрезентативные критичные пути). */
export const CSRF_CRITICAL_MUTATING_API_PATHS = [
  "/api/certificates/generate",
  "/api/practice/upload-file",
  "/api/ai/chat",
  "/api/profile/avatar",
  "/api/practice/phishing/check",
] as const;

/** Server Actions с изменением состояния (защита Next.js, не middleware). */
export const CSRF_SERVER_ACTION_MODULES = [
  "register.ts",
  "logout.ts",
  "password-reset.ts",
  "profile.ts",
  "user-settings.ts",
  "lesson.ts",
  "test.ts",
  "practice.ts",
  "review-submit.ts",
  "admin-modules.ts",
  "admin-lessons.ts",
  "admin-tests.ts",
  "admin-practical-tasks.ts",
  "admin-users.ts",
  "admin-submissions.ts",
  "admin-certificates.ts",
  "admin-reviews.ts",
] as const;

export type StateChangingSurface =
  | "login"
  | "logout"
  | "registration"
  | "profile_update"
  | "lesson_completion"
  | "test_submit"
  | "practice_submit"
  | "practice_review"
  | "certificate_issue"
  | "certificate_revoke"
  | "admin_content"
  | "export"
  | "upload";

/** Как защищена каждая зона (для аудита / тестов). */
export const CSRF_SURFACE_PROTECTION: Record<
  StateChangingSurface,
  { mechanism: "nextauth_csrf" | "nextjs_server_action" | "middleware_origin" | "get_safe"; detail: string }
> = {
  login: {
    mechanism: "nextauth_csrf",
    detail: "signIn → POST /api/auth/callback/credentials + csrfToken from /api/auth/csrf",
  },
  logout: {
    mechanism: "nextjs_server_action",
    detail: "logoutAction (use server)",
  },
  registration: {
    mechanism: "nextjs_server_action",
    detail: "registerAction (use server)",
  },
  profile_update: {
    mechanism: "nextjs_server_action",
    detail: "updateProfileAction, user-settings; avatar PATCH/POST → middleware Origin on /api/profile/*",
  },
  lesson_completion: {
    mechanism: "nextjs_server_action",
    detail: "completeLessonAction, regenerateLessonAiAction",
  },
  test_submit: {
    mechanism: "nextjs_server_action",
    detail: "submitTestAttemptAction",
  },
  practice_submit: {
    mechanism: "nextjs_server_action",
    detail: "submitPractice* actions; inline checks → POST /api/practice/* (middleware)",
  },
  practice_review: {
    mechanism: "nextjs_server_action",
    detail: "admin-submissions review actions",
  },
  certificate_issue: {
    mechanism: "middleware_origin",
    detail: "POST /api/certificates/generate + admin issue Server Action",
  },
  certificate_revoke: {
    mechanism: "nextjs_server_action",
    detail: "revokeCertificateAdminAction",
  },
  admin_content: {
    mechanism: "nextjs_server_action",
    detail: "admin-modules, lessons, tests, tasks, reviews",
  },
  export: {
    mechanism: "get_safe",
    detail: "GET /api/admin/export — CSRF не требуется; auth+RBAC в withApiGuard",
  },
  upload: {
    mechanism: "middleware_origin",
    detail: "POST /api/profile/avatar/upload, /api/practice/upload-file, submit-combined",
  },
};

export function isCsrfExemptApiPath(pathname: string): boolean {
  if (pathname.startsWith(CSRF_API_AUTH_EXEMPT_PREFIX)) return true;
  return (CSRF_API_EXEMPT_PATHS as readonly string[]).includes(pathname);
}
