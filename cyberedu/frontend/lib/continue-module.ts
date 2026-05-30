import { findFocusModule } from "@/lib/dashboard-ui";
import { getDefaultCourseForDashboard, syncAndGetUserCourseProgress } from "@/lib/progress";

/** Текущий (первый незавершённый) модуль курса для редиректов «Уроки» / «Тесты». */
export async function getContinueModuleIdForUser(userId: string): Promise<string | null> {
  const course = await getDefaultCourseForDashboard();
  if (!course) return null;

  const data = await syncAndGetUserCourseProgress(userId, course.id);
  if (!data?.modules.length) return null;

  const focus = findFocusModule(data.modules);
  return focus?.module.id ?? null;
}
