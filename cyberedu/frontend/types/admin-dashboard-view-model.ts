/** UI-модель главной админки (control center). Без секретов, ответов и env. */

export type AdminKpis = {
  totalStudents: number;
  activeStudents7d: number;
  averageProgressPercentage: number;
  pendingPracticeReviews: number;
  issuedCertificates: number;
  failedLogins24h?: number;
  securityEvents24h?: number;
};

export type AdminPracticeReviewStatus = "submitted" | "pending_review" | "needs_retry";

export type PracticeReviewQueueItem = {
  submissionId: string;
  studentDisplayName: string;
  studentId: string;
  practiceTitle: string;
  moduleTitle: string;
  submittedAt: string;
  status: AdminPracticeReviewStatus;
  href: string;
};

export type CourseHealthModule = {
  moduleId: string;
  title: string;
  completionPercent: number;
  href: string;
};

export type CourseHealthTest = {
  testId: string;
  title: string;
  moduleTitle: string;
  failRatePercent: number;
  attempts: number;
  href: string;
};

export type CourseHealthTopic = {
  topicId: string;
  topic: string;
  moduleId: string;
  moduleTitle: string;
  mentionCount: number;
  href: string;
};

export type CourseHealthDropOff = {
  id: string;
  kind: "lesson" | "test" | "practice" | "module";
  kindLabel: string;
  title: string;
  moduleTitle: string;
  stalledCount: number;
  href: string;
};

export type CourseHealthSummary = {
  lowCompletionModules: CourseHealthModule[];
  highFailRateTests: CourseHealthTest[];
  weakTopics: CourseHealthTopic[];
  dropOffPoints: CourseHealthDropOff[];
};

export type AdminStudentSummary = {
  id: string;
  displayName: string;
  email?: string;
  progressPercentage: number;
  lastActiveAt?: string;
  status: "active" | "inactive" | "completed";
  href: string;
};

export type AdminContentSummary = {
  modulesCount: number;
  lessonsCount: number;
  testsCount: number;
  practicesCount: number;
  draftContentCount?: number;
};

/** Краткая запись для виджета на главной админки (не полный реестр). */
export type AdminDashboardCertificateTeaser = {
  id: string;
  certificateNumber: string;
  courseTitle: string;
  issuedAt: string;
  href: string;
};

export type AdminCertificateSummary = {
  issuedCount: number;
  readyCount?: number;
  recent: AdminDashboardCertificateTeaser[];
};

export type AdminAuditSeverity = "info" | "warning" | "critical";

export type AdminAuditEvent = {
  id: string;
  type: string;
  actorDisplayName?: string;
  action: string;
  createdAt: string;
  severity: AdminAuditSeverity;
  href?: string;
};

export type AdminSystemHealth = "ok" | "degraded" | "unknown";

export type AdminSystemStatus = {
  database: AdminSystemHealth;
  redis?: AdminSystemHealth;
  ai: "ok" | "disabled" | "degraded" | "unknown";
  storage: AdminSystemHealth;
  lastBackupAt?: string;
  lastSmokeTestAt?: string;
};

export type AdminDashboardViewModel = {
  kpis: AdminKpis;
  reviewQueue: PracticeReviewQueueItem[];
  courseHealth: CourseHealthSummary;
  students: AdminStudentSummary[];
  contentSummary: AdminContentSummary;
  certificates: AdminCertificateSummary;
  auditEvents: AdminAuditEvent[];
  systemStatus?: AdminSystemStatus;
};

/** Поля, которые нельзя добавлять в UI-модель админки (регрессионный контракт). */
export const ADMIN_DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS = [
  "password",
  "passwordHash",
  "password_hash",
  "sessionToken",
  "session_token",
  "refreshToken",
  "accessToken",
  "apiKey",
  "api_key",
  "token",
  "secret",
  "rawSecret",
  "env",
  "processEnv",
  "connectionString",
  "databaseUrl",
  "DATABASE_URL",
  "REDIS_URL",
  "privateStoragePath",
  "rawLogs",
  "fullLogs",
  "sensitiveLogs",
  "answerKey",
  "correctAnswer",
  "correctAnswers",
  "correctOptionId",
  "correctAnswerId",
  "solution",
  "solutionText",
  "hiddenRubric",
  "gradingRubric",
  "safeRubric",
  "scoringRules",
  "rawScoringRules",
  "autoKeywords",
  "autoCheckRules",
  "textAnswer",
  "fileUrl",
  "adminComment",
  "adminNotes",
  "internalNotes",
  "graderNotes",
  "verificationCode",
  "meta",
] as const;

export type AdminDashboardViewModelForbiddenKey =
  (typeof ADMIN_DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS)[number];
