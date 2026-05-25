import type { AchievementRow } from "@/lib/achievements";
import {
  buildAiRecommendation,
  buildContinueLearningCard,
  buildWeakTopicRecommendations,
  computeStepMetrics,
  getCertificateEligibility,
  getPendingPracticeReviews,
} from "@/lib/dashboard-ui";
import { buildRecentActivityFeedItems } from "@/lib/recent-activity-feed";
import { buildRoadmapPreviewItems } from "@/lib/roadmap-preview";
import { buildDashboardAiWidgetQuickActions } from "@/lib/dashboard-ai-widget";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import type { SubmissionStatus } from "@prisma/client";
import {
  DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS,
  type DashboardAchievement,
  type DashboardActivityItem,
  type DashboardAISuggestion,
  type DashboardCertificateProgress,
  type DashboardCertificateStatus,
  type DashboardCourseSummary,
  type DashboardNextStep,
  type DashboardNextStepType,
  type DashboardPracticeStatus,
  type DashboardPracticeStatusKind,
  type DashboardProgress,
  type DashboardRecommendation,
  type DashboardRecommendationType,
  type DashboardRoadmapItem,
  type DashboardUser,
  type DashboardWeakTopic,
  type DashboardViewModelForbiddenKey,
  type StudentDashboardViewModel,
} from "@/types/dashboard-view-model";

const FORBIDDEN_KEY_SET = new Set<string>(DASHBOARD_VIEW_MODEL_FORBIDDEN_KEYS);

function parseEstimatedMinutes(label: string | null | undefined): number | undefined {
  if (!label) return undefined;
  const nums = label.match(/\d+/g)?.map((n) => Number.parseInt(n, 10)).filter(Number.isFinite);
  if (!nums?.length) return undefined;
  if (nums.length === 1) return nums[0];
  return Math.round((nums[0]! + nums[nums.length - 1]!) / 2);
}

function mapContinueKindToNextType(kind: ReturnType<typeof buildContinueLearningCard>["kind"]): DashboardNextStepType {
  if (kind === "empty") return "course";
  return kind;
}

function mapSubmissionToPracticeStatus(status: SubmissionStatus): DashboardPracticeStatusKind {
  switch (status) {
    case "ACCEPTED":
      return "approved";
    case "REJECTED":
      return "rejected";
    case "NEEDS_REVISION":
      return "needs_retry";
    case "SUBMITTED":
      return "submitted";
    case "CHECKING":
      return "pending_review";
    default:
      return "submitted";
  }
}

function mapRecentActivity(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardActivityItem[] {
  return buildRecentActivityFeedItems(stats, modules).map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    createdAt: item.createdAt,
    href: item.href,
  }));
}

function mapWeakTopics(items: ReturnType<typeof buildWeakTopicRecommendations>): DashboardWeakTopic[] {
  return items.map((item) => {
    const lessonHref = item.href.includes("/lesson")
      ? item.href
      : (() => {
          const match = item.href.match(/\/dashboard\/course\/([^/]+)/);
          if (!match?.[1]) return undefined;
          return `/dashboard/course/${match[1]}/lesson`;
        })();
    return {
      title: item.title,
      reason: item.reason,
      relatedLessonHref: lessonHref,
    };
  });
}

function mapRoadmap(
  modules: CourseProgressModuleRow[],
  currentModuleId: string | null,
): DashboardRoadmapItem[] {
  return buildRoadmapPreviewItems(modules, currentModuleId).map((row) => ({
    moduleId: row.moduleId,
    title: row.title,
    status: row.status,
    progressPercentage: row.progressPercentage > 0 ? row.progressPercentage : undefined,
    href: row.href,
    lockedReason: row.lockedReason,
  }));
}

function mapPendingPractices(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardPracticeStatus[] {
  const fromUi = getPendingPracticeReviews(stats, modules);
  const mapped = fromUi.map((item) => {
    const submission = stats.recentSubmissions.find(
      (s) => s.moduleId === item.moduleId && s.taskTitle === item.taskTitle,
    );
    const status = submission
      ? mapSubmissionToPracticeStatus(submission.status)
      : ("pending_review" as const);
    return {
      id: item.id,
      title: item.taskTitle,
      moduleTitle: item.moduleTitle,
      status,
      submittedAt: item.at,
      href: item.href,
    };
  });

  const seen = new Set(mapped.map((m) => m.id));
  for (const s of stats.recentSubmissions) {
    if (s.outcome !== "pending") continue;
    const key = `${s.moduleId}:${s.taskTitle}`;
    if (seen.has(key)) continue;
    seen.add(key);
    mapped.push({
      id: key,
      title: s.taskTitle,
      moduleTitle: s.moduleTitle,
      status: mapSubmissionToPracticeStatus(s.status),
      submittedAt: s.at,
      href: `/dashboard/course/${s.moduleId}/practice`,
    });
  }

  return mapped.slice(0, 5);
}

function mapAchievements(rows: AchievementRow[]): DashboardAchievement[] {
  return rows.map((row) => ({
    id: row.kind,
    title: row.title,
    description: row.unlocked ? row.description : row.hintLocked,
    earnedAt: row.unlockedAt ?? undefined,
    icon: row.slug,
    status: row.unlocked ? "earned" : "locked",
  }));
}

function resolveCertificateStatus(stats: ProfileCourseStats): DashboardCertificateStatus {
  if (stats.certificateIssued) return "issued";
  if (stats.allModulesComplete && stats.canGenerateCertificate) return "ready";
  if (stats.totalModules > 0) return "in_progress";
  return "not_available";
}

function mapCertificate(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardCertificateProgress {
  const metrics = computeStepMetrics(modules);
  const eligibility = getCertificateEligibility(stats, metrics);
  const remainingRequirements = eligibility.requirements
    .filter((r) => !r.met)
    .map((r) => r.label);

  return {
    status: resolveCertificateStatus(stats),
    percentage: stats.progressPercent,
    remainingRequirements,
    href: eligibility.ctaHref,
  };
}

function mapRecommendations(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
  weakTopics: DashboardWeakTopic[],
): DashboardRecommendation[] {
  const items: DashboardRecommendation[] = [];

  for (const topic of weakTopics.slice(0, 3)) {
    const href = topic.relatedLessonHref ?? "/dashboard/course";
    let type: DashboardRecommendationType = "lesson";
    if (href.includes("/test")) type = "test";
    else if (href.includes("/practice")) type = "practice";

    items.push({
      title: topic.title,
      description: topic.reason,
      href,
      type,
    });
  }

  const ai = buildAiRecommendation(stats, modules);
  items.push({
    title: ai.actionLabel,
    description: ai.message,
    href: ai.mentorHref,
    type: "ai",
  });

  return items.slice(0, 5);
}

function mapAiSuggestions(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardAISuggestion[] {
  const weak = buildWeakTopicRecommendations(stats, modules);
  return buildDashboardAiWidgetQuickActions(stats, modules, weak).map((action) => ({
    title: action.label,
    prompt: action.prompt,
    mode: action.id,
  }));
}

function mapNextStep(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[],
): DashboardNextStep | undefined {
  const card = buildContinueLearningCard(stats, modules);
  return {
    type: mapContinueKindToNextType(card.kind),
    title: card.title,
    description: card.description,
    moduleTitle: card.moduleTitle,
    estimatedMinutes: parseEstimatedMinutes(card.estimatedLabel),
    href: card.href,
    status: card.statusLabel,
  };
}

function mapProgress(stats: ProfileCourseStats, modules: CourseProgressModuleRow[]): DashboardProgress {
  const steps = computeStepMetrics(modules);
  return {
    percentage: stats.progressPercent,
    completedModules: stats.completedModules,
    totalModules: stats.totalModules,
    completedLessons: steps.lessonsDone,
    totalLessons: steps.lessonsTotal,
    passedTests: steps.testsDone,
    totalTests: steps.testsTotal,
    approvedPractices: steps.practiceDone,
    totalPractices: steps.practiceTotal,
  };
}

export type BuildStudentDashboardViewModelInput = {
  userId: string;
  displayName: string;
  name?: string | null;
  stats: ProfileCourseStats;
  modules: CourseProgressModuleRow[];
  achievements: AchievementRow[];
  courseDescription?: string | null;
};

/** Собирает безопасную UI-модель кабинета из серверных агрегатов (без ответов и рубрик). */
export function buildStudentDashboardViewModel(
  input: BuildStudentDashboardViewModelInput,
): StudentDashboardViewModel {
  const { stats, modules, achievements, userId, displayName, name } = input;

  const user: DashboardUser = {
    id: userId,
    name: name?.trim() || undefined,
    displayName: displayName.trim() || undefined,
  };

  const course: DashboardCourseSummary = {
    id: stats.courseId,
    title: stats.courseTitle,
    description: input.courseDescription?.trim() || undefined,
  };

  const weakTopicItems = buildWeakTopicRecommendations(stats, modules);
  const weakTopics = mapWeakTopics(weakTopicItems);

  return {
    user,
    course,
    progress: mapProgress(stats, modules),
    nextStep: mapNextStep(stats, modules),
    roadmapPreview: mapRoadmap(modules, stats.currentModuleId),
    pendingPractices: mapPendingPractices(stats, modules),
    weakTopics,
    recommendations: mapRecommendations(stats, modules, weakTopics),
    achievements: mapAchievements(achievements),
    certificate: mapCertificate(stats, modules),
    recentActivity: mapRecentActivity(stats, modules),
    aiSuggestions: mapAiSuggestions(stats, modules),
  };
}

/** Рекурсивный сбор запрещённых ключей (для тестов и санитайзера). */
export function collectForbiddenDashboardKeys(
  value: unknown,
  found = new Set<string>(),
  depth = 0,
): DashboardViewModelForbiddenKey[] {
  if (depth > 8 || value == null || typeof value !== "object") {
    return [...found] as DashboardViewModelForbiddenKey[];
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectForbiddenDashboardKeys(entry, found, depth + 1);
    }
    return [...found] as DashboardViewModelForbiddenKey[];
  }

  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_KEY_SET.has(key)) {
      found.add(key);
    }
    collectForbiddenDashboardKeys(child, found, depth + 1);
  }

  return [...found] as DashboardViewModelForbiddenKey[];
}

export function assertCleanDashboardViewPayload(value: unknown): void {
  const keys = collectForbiddenDashboardKeys(value);
  if (keys.length > 0) {
    throw new Error(`Dashboard view model contains forbidden keys: ${keys.join(", ")}`);
  }
}
