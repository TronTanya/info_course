import { checkPracticeEntry } from "@/lib/course-progress-guards";
import { recalculateModuleProgress } from "@/lib/progress";

/** Совпадает с checkPracticeEntry: модуль, лекция/видео, все тесты модуля (если есть). */
export async function isPracticeUnlockedForUser(userId: string, moduleId: string): Promise<boolean> {
  const r = await checkPracticeEntry(userId, moduleId);
  return r.ok;
}

export async function recalculateAfterSubmission(userId: string, moduleId: string): Promise<void> {
  await recalculateModuleProgress(userId, moduleId);
}
