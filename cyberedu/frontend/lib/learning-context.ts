import { buildModuleHubSteps } from "@/lib/module-hub-steps";
import {
  buildLearningNavModules,
  getLearningStepNeighbors,
  markActiveLearningSteps,
  type LearningNavModuleItem,
  type LearningNavStepItem,
  type LearningStepNeighbors,
} from "@/lib/learning-nav";
import type { ModuleRequirements, ProgressRow } from "@/lib/progress";
import { getDefaultCourseForDashboard, syncAndGetUserCourseProgress } from "@/lib/progress";

export type LearningPageContext = {
  courseTitle: string;
  courseProgressPercent: number;
  modules: LearningNavModuleItem[];
  steps: LearningNavStepItem[];
  neighbors: LearningStepNeighbors;
};

export async function buildLearningPageContext(
  userId: string,
  moduleId: string,
  currentPath: string,
  requirements: ModuleRequirements,
  progress: ProgressRow | null,
): Promise<LearningPageContext> {
  const course = await getDefaultCourseForDashboard();
  const courseProgress = course ? await syncAndGetUserCourseProgress(userId, course.id) : null;
  const modules = courseProgress?.modules ?? [];
  const hubSteps = buildModuleHubSteps(moduleId, true, requirements, progress);

  return {
    courseTitle: course?.title ?? "Курс",
    courseProgressPercent: courseProgress?.overallProgressPercent ?? 0,
    modules: buildLearningNavModules(modules, moduleId),
    steps: markActiveLearningSteps(hubSteps, currentPath),
    neighbors: getLearningStepNeighbors(hubSteps, moduleId, currentPath),
  };
}
