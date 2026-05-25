import type { CertificateDashboardState } from "@/lib/certificate";
import { logError } from "@/lib/log/structured";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import {
  getDefaultCourseForDashboard,
  syncAndGetUserCourseProgress,
  type UserCourseProgressResult,
} from "@/lib/progress";
import { getCertificateDashboardState } from "@/lib/certificate";
import { getProfileCourseStats } from "@/lib/profile-course-stats";

export type CoursePageLoadErrorKind = "progress" | "modules";

export type CoursePageLoadResult =
  | {
      status: "ok";
      course: { id: string; title: string; description: string | null };
      data: UserCourseProgressResult;
      certState: CertificateDashboardState | null;
      stats: ProfileCourseStats | null;
    }
  | { status: "empty"; kind: "course_not_found" }
  | { status: "error"; kind: CoursePageLoadErrorKind };

function safeErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 120);
  }
  return undefined;
}

/**
 * Загрузка данных страницы курса с безопасным логированием (без проброса stack trace в UI).
 */
export async function loadCoursePageData(userId: string): Promise<CoursePageLoadResult> {
  let course: Awaited<ReturnType<typeof getDefaultCourseForDashboard>>;
  try {
    course = await getDefaultCourseForDashboard();
  } catch (error) {
    logError("course_page_modules_load_failed", {
      userId,
      code: safeErrorCode(error),
    });
    return { status: "error", kind: "modules" };
  }

  if (!course) {
    return { status: "empty", kind: "course_not_found" };
  }

  let data: UserCourseProgressResult | null;
  try {
    data = await syncAndGetUserCourseProgress(userId, course.id);
  } catch (error) {
    logError("course_page_progress_load_failed", {
      userId,
      courseId: course.id,
      code: safeErrorCode(error),
    });
    return { status: "error", kind: "progress" };
  }

  if (!data) {
    logError("course_page_progress_empty", {
      userId,
      courseId: course.id,
    });
    return { status: "error", kind: "progress" };
  }

  let certState: CertificateDashboardState | null = null;
  let stats: ProfileCourseStats | null = null;
  try {
    [certState, stats] = await Promise.all([
      getCertificateDashboardState(userId),
      getProfileCourseStats(userId),
    ]);
  } catch (error) {
    logError("course_page_secondary_load_failed", {
      userId,
      courseId: course.id,
      code: safeErrorCode(error),
    });
  }

  return {
    status: "ok",
    course,
    data,
    certState,
    stats,
  };
}
