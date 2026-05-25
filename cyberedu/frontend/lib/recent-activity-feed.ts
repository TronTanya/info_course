import { DASHBOARD_EMPTY_COPY } from "@/lib/dashboard-empty-copy";
import { dashboardHrefByModuleId } from "@/lib/dashboard-learning-links";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow } from "@/lib/progress";
import type { DashboardActivityType } from "@/types/dashboard-view-model";
import type { SubmissionStatus } from "@prisma/client";

export const RECENT_ACTIVITY_FEED_MAX = 8;
export const RECENT_ACTIVITY_FEED_MIN = 5;

export const RECENT_ACTIVITY_EMPTY_MESSAGE = DASHBOARD_EMPTY_COPY.no_activity.description;

export const RECENT_ACTIVITY_TYPE_LABELS: Record<DashboardActivityType, string> = {
  lesson_completed: "Завершён урок",
  test_passed: "Сдан тест",
  practice_submitted: "Практика отправлена",
  practice_approved: "Практика принята",
  certificate_issued: "Получен сертификат",
  module_opened: "Открыт новый модуль",
};

export type RecentActivityFeedItem = {
  id: string;
  type: DashboardActivityType;
  typeLabel: string;
  title: string;
  createdAt: string;
  href?: string;
};

function toIsoDate(value: Date | string): string {
  return typeof value === "string" ? value : value.toISOString();
}

function submissionActivityType(
  status: SubmissionStatus,
): "practice_submitted" | "practice_approved" | null {
  if (status === "ACCEPTED") return "practice_approved";
  if (status === "SUBMITTED" || status === "CHECKING") return "practice_submitted";
  return null;
}

function pushItem(
  bucket: RecentActivityFeedItem[],
  item: RecentActivityFeedItem,
  seen: Set<string>,
): void {
  if (seen.has(item.id)) return;
  seen.add(item.id);
  bucket.push(item);
}

function feedItem(
  id: string,
  type: DashboardActivityType,
  title: string,
  createdAt: string,
  href?: string,
): RecentActivityFeedItem {
  return {
    id,
    type,
    typeLabel: RECENT_ACTIVITY_TYPE_LABELS[type],
    title: title.trim() || RECENT_ACTIVITY_TYPE_LABELS[type],
    createdAt,
    href,
  };
}

/**
 * Лента активности для кабинета: только учебные события из stats/modules.
 * Без audit/security логов, IP, user-agent и admin-only полей.
 */
export function buildRecentActivityFeedItems(
  stats: ProfileCourseStats,
  modules: CourseProgressModuleRow[] = [],
  limit = RECENT_ACTIVITY_FEED_MAX,
): RecentActivityFeedItem[] {
  const items: RecentActivityFeedItem[] = [];
  const seen = new Set<string>();

  if (stats.certificateIssued && stats.issuedAt) {
    pushItem(
      items,
      feedItem(
        "certificate-issued",
        "certificate_issued",
        stats.certificateNumber
          ? `Сертификат № ${stats.certificateNumber}`
          : stats.courseTitle,
        toIsoDate(stats.issuedAt),
        "/dashboard/certificate",
      ),
      seen,
    );
  }

  for (const submission of stats.recentSubmissions) {
    const type = submissionActivityType(submission.status);
    if (!type) continue;
    pushItem(
      items,
      feedItem(
        `practice-${submission.moduleId}-${submission.at}-${type}`,
        type,
        submission.taskTitle,
        submission.at,
        dashboardHrefByModuleId(modules, submission.moduleId, "practice"),
      ),
      seen,
    );
  }

  for (const attempt of stats.recentTests) {
    if (!attempt.passed) continue;
    pushItem(
      items,
      feedItem(
        `test-${attempt.moduleId}-${attempt.at}`,
        "test_passed",
        attempt.testTitle,
        attempt.at,
        dashboardHrefByModuleId(modules, attempt.moduleId, "test"),
      ),
      seen,
    );
  }

  if (stats.lastLesson) {
    const lessonRow = modules.find((m) => m.module.title === stats.lastLesson?.moduleTitle);
    pushItem(
      items,
      feedItem(
        "lesson-last",
        "lesson_completed",
        stats.lastLesson.lessonTitle,
        stats.lastLesson.at,
        lessonRow
          ? dashboardHrefByModuleId(modules, lessonRow.module.id, "lesson")
          : "/dashboard/course",
      ),
      seen,
    );
  }

  for (const row of modules) {
    const p = row.progress;
    if (!row.unlocked || !p) continue;

    const moduleTitle = row.module.title;
    const moduleId = row.module.id;

    if (p.lessonCompleted) {
      pushItem(
        items,
        feedItem(
          `lesson-${moduleId}-${toIsoDate(p.updatedAt)}`,
          "lesson_completed",
          moduleTitle,
          toIsoDate(p.updatedAt),
          dashboardHrefByModuleId(modules, moduleId, "lesson"),
        ),
        seen,
      );
    }

    if (p.testCompleted) {
      pushItem(
        items,
        feedItem(
          `test-module-${moduleId}-${toIsoDate(p.updatedAt)}`,
          "test_passed",
          moduleTitle,
          toIsoDate(p.updatedAt),
          dashboardHrefByModuleId(modules, moduleId, "test"),
        ),
        seen,
      );
    }

    const opened =
      !row.moduleCompleted &&
      !p.lessonCompleted &&
      !p.videoCompleted &&
      !p.testCompleted &&
      !p.practiceCompleted;
    if (opened && row.module.orderNumber > 1) {
      pushItem(
        items,
        feedItem(
          `module-open-${moduleId}-${toIsoDate(p.createdAt)}`,
          "module_opened",
          moduleTitle,
          toIsoDate(p.createdAt),
          dashboardHrefByModuleId(modules, moduleId),
        ),
        seen,
      );
    }
  }

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, Math.min(RECENT_ACTIVITY_FEED_MAX, Math.max(1, limit)));
}
