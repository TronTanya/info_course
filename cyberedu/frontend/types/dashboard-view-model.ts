/**
 * UI-модель личного кабинета (learning cockpit).
 *
 * Намеренно отсутствуют: correct answers, answerKey, solutions, hidden rubric,
 * admin-only notes, private scoring internals, сырые логи с чувствительными данными,
 * токены, секреты, env.
 */

export type DashboardUser = {
  id: string;
  name?: string;
  displayName?: string;
};

export type DashboardCourseSummary = {
  id: string;
  title: string;
  description?: string;
};

export type DashboardProgress = {
  percentage: number;
  completedModules: number;
  totalModules: number;
  completedLessons: number;
  totalLessons: number;
  passedTests: number;
  totalTests: number;
  approvedPractices: number;
  totalPractices: number;
};

export type DashboardNextStepType = "lesson" | "test" | "practice" | "certificate" | "course";

export type DashboardNextStep = {
  type: DashboardNextStepType;
  title: string;
  description?: string;
  moduleTitle?: string;
  estimatedMinutes?: number;
  href: string;
  status?: string;
};

export type DashboardRoadmapItemStatus = "locked" | "available" | "in_progress" | "completed";

export type DashboardRoadmapItem = {
  moduleId: string;
  title: string;
  status: DashboardRoadmapItemStatus;
  progressPercentage?: number;
  href: string;
  lockedReason?: string;
};

export type DashboardPracticeStatusKind =
  | "submitted"
  | "pending_review"
  | "approved"
  | "needs_retry"
  | "rejected";

export type DashboardPracticeStatus = {
  id: string;
  title: string;
  moduleTitle: string;
  status: DashboardPracticeStatusKind;
  submittedAt?: string;
  href: string;
  /** Санитизированный feedback для студента (не admin-only). */
  studentFeedback?: string;
};

export type DashboardWeakTopic = {
  title: string;
  reason?: string;
  relatedLessonHref?: string;
};

export type DashboardRecommendationType = "lesson" | "test" | "practice" | "ai";

export type DashboardRecommendation = {
  title: string;
  description?: string;
  href?: string;
  type: DashboardRecommendationType;
};

export type DashboardAchievementStatus = "earned" | "locked" | "in_progress";

export type DashboardAchievement = {
  id: string;
  title: string;
  description?: string;
  earnedAt?: string;
  icon?: string;
  status: DashboardAchievementStatus;
};

export type DashboardCertificateStatus = "not_available" | "in_progress" | "ready" | "issued";

export type DashboardCertificateProgress = {
  status: DashboardCertificateStatus;
  percentage: number;
  remainingRequirements: string[];
  href?: string;
};

export type DashboardActivityType =
  | "lesson_completed"
  | "test_passed"
  | "practice_submitted"
  | "practice_approved"
  | "certificate_issued"
  | "module_opened";

export type DashboardActivityItem = {
  id: string;
  type: DashboardActivityType;
  title: string;
  createdAt: string;
  href?: string;
};

export type DashboardAISuggestion = {
  title: string;
  prompt: string;
  mode: string;
};

export type StudentDashboardViewModel = {
  user: DashboardUser;
  course: DashboardCourseSummary;
  progress: DashboardProgress;
  nextStep?: DashboardNextStep;
  roadmapPreview: DashboardRoadmapItem[];
  pendingPractices: DashboardPracticeStatus[];
  weakTopics: DashboardWeakTopic[];
  recommendations: DashboardRecommendation[];
  achievements: DashboardAchievement[];
  certificate: DashboardCertificateProgress;
  recentActivity: DashboardActivityItem[];
  aiSuggestions: DashboardAISuggestion[];
};

/** Поля, которые нельзя добавлять в UI-модель кабинета (регрессионный контракт). */
export const DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS = [
  "correctAnswer",
  "correctAnswers",
  "correctOptionId",
  "correctAnswerId",
  "answerKey",
  "solution",
  "solutionText",
  "hiddenRubric",
  "gradingRubric",
  "safeRubric",
  "scoringRules",
  "rawScoringRules",
  "autoKeywords",
  "autoCheckRules",
  "adminNotes",
  "adminComment",
  "internalNotes",
  "graderNotes",
  "privateStoragePath",
  "rawLogs",
  "logs",
  "apiKey",
  "api_key",
  "token",
  "accessToken",
  "refreshToken",
  "password",
  "env",
  "userEmail",
  "email",
] as const;

export type DashboardViewModelForbiddenKey = (typeof DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS)[number];
