import { achievementNoticesFromKinds, getUserAchievementRows, reconcileUserAchievements } from "@/lib/achievements";
import { isAiConfigured } from "@/lib/ai-config";
import { logError } from "@/lib/log/structured";
import { getProfileCourseStats, type ProfileCourseStats } from "@/lib/profile-course-stats";
import { syncAndGetUserCourseProgress, type CourseProgressModuleRow } from "@/lib/progress";
import type { AchievementRow } from "@/lib/achievements";
import type { Session } from "next-auth";

export type DashboardPageLoadErrorKind = "dashboard" | "progress";

export type DashboardPageLoadResult =
  | { status: "unauthorized" }
  | { status: "empty" }
  | { status: "error"; kind: DashboardPageLoadErrorKind }
  | {
      status: "ok";
      displayName: string;
      stats: ProfileCourseStats;
      modules: CourseProgressModuleRow[];
      achievements: AchievementRow[];
      achievementUnlocks: ReturnType<typeof achievementNoticesFromKinds>;
      aiMentorConfigured: boolean;
    };

function safeErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 120);
  }
  return undefined;
}

function resolveDisplayName(session: Session): string {
  return session.user.name?.trim() || session.user.email?.split("@")[0] || "студент";
}

/**
 * Загрузка данных кабинета. Ошибки логируются структурно, в UI — только безопасные тексты.
 */
export async function loadDashboardPageData(
  userId: string | undefined,
  session: Session | null,
): Promise<DashboardPageLoadResult> {
  if (!userId || !session?.user?.id) {
    return { status: "unauthorized" };
  }

  let stats: ProfileCourseStats | null;
  let achievementUnlocks: ReturnType<typeof achievementNoticesFromKinds> = [];

  try {
    const [statsResult, newUnlocks] = await Promise.all([
      getProfileCourseStats(userId),
      reconcileUserAchievements(userId),
    ]);
    stats = statsResult;
    achievementUnlocks = achievementNoticesFromKinds(newUnlocks);
  } catch (error) {
    logError("dashboard_page_stats_load_failed", {
      userId,
      code: safeErrorCode(error),
    });
    return { status: "error", kind: "dashboard" };
  }

  if (!stats) {
    return { status: "empty" };
  }

  let modules: CourseProgressModuleRow[] = [];
  try {
    const progress = await syncAndGetUserCourseProgress(userId, stats.courseId);
    if (!progress) {
      logError("dashboard_page_progress_empty", {
        userId,
        courseId: stats.courseId,
      });
      return { status: "error", kind: "progress" };
    }
    modules = progress.modules;
  } catch (error) {
    logError("dashboard_page_progress_load_failed", {
      userId,
      courseId: stats.courseId,
      code: safeErrorCode(error),
    });
    return { status: "error", kind: "progress" };
  }

  let achievements: AchievementRow[] = [];
  try {
    achievements = await getUserAchievementRows(userId);
  } catch (error) {
    logError("dashboard_page_achievements_load_failed", {
      userId,
      code: safeErrorCode(error),
    });
    return { status: "error", kind: "dashboard" };
  }

  return {
    status: "ok",
    displayName: resolveDisplayName(session),
    stats,
    modules,
    achievements,
    achievementUnlocks,
    aiMentorConfigured: isAiConfigured(),
  };
}
