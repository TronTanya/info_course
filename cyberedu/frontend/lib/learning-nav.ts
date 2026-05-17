import type { ModuleHubStepView } from "@/lib/module-hub-steps";
import type { CourseProgressModuleRow } from "@/lib/progress";

export type LearningNavModuleItem = {
  id: string;
  orderNumber: number;
  title: string;
  unlocked: boolean;
  completed: boolean;
  isCurrent: boolean;
  href: string;
};

export type LearningNavStepItem = ModuleHubStepView & { isActive: boolean };

export type LearningStepLink = {
  label: string;
  href: string;
  disabled: boolean;
  hint?: string;
};

export type LearningStepNeighbors = {
  previous: LearningStepLink | null;
  next: LearningStepLink | null;
};

export function buildLearningNavModules(
  modules: CourseProgressModuleRow[],
  currentModuleId: string,
): LearningNavModuleItem[] {
  return modules.map((row) => ({
    id: row.module.id,
    orderNumber: row.module.orderNumber,
    title: row.module.title,
    unlocked: row.unlocked,
    completed: row.moduleCompleted,
    isCurrent: row.module.id === currentModuleId,
    href: row.unlocked ? `/dashboard/course/${row.module.id}` : "/dashboard/course?locked=1",
  }));
}

export function markActiveLearningSteps(
  steps: ModuleHubStepView[],
  currentPath: string,
): LearningNavStepItem[] {
  const normalized = currentPath.split("?")[0] ?? currentPath;
  return steps.map((step) => {
    const href = step.actionHref?.split("?")[0];
    const isActive = Boolean(
      href &&
        (normalized === href ||
          normalized.endsWith(href) ||
          (href.endsWith("/lesson") && normalized.includes("/lesson"))),
    );
    return { ...step, isActive };
  });
}

function stepLink(step: ModuleHubStepView, prefix: string): LearningStepLink {
  const blocked = step.status === "blocked";
  const href =
    step.actionHref ??
    (step.kind === "lecture"
      ? `${prefix}/lesson`
      : step.kind === "test"
        ? `${prefix}/test`
        : step.kind === "practice"
          ? `${prefix}/practice`
          : prefix);
  return {
    label: step.title,
    href,
    disabled: blocked,
    hint: step.description,
  };
}

export function getLearningStepNeighbors(
  steps: ModuleHubStepView[],
  moduleId: string,
  currentPath: string,
): LearningStepNeighbors {
  const prefix = `/dashboard/course/${moduleId}`;
  const marked = markActiveLearningSteps(steps, currentPath);
  let activeIndex = marked.findIndex((s) => s.isActive);
  if (activeIndex < 0) {
    if (currentPath.includes("/lesson")) activeIndex = marked.findIndex((s) => s.kind === "lecture");
    else if (currentPath.includes("/test")) activeIndex = marked.findIndex((s) => s.kind === "test");
    else if (currentPath.includes("/practice")) activeIndex = marked.findIndex((s) => s.kind === "practice");
    else activeIndex = marked.findIndex((s) => s.status === "available");
  }

  const prevStep = activeIndex > 0 ? marked[activeIndex - 1] : null;
  const nextStep = activeIndex >= 0 && activeIndex < marked.length - 1 ? marked[activeIndex + 1] : null;

  const toPrev = (): LearningStepLink | null => {
    if (!prevStep) {
      return {
        label: "К модулю",
        href: prefix,
        disabled: false,
        hint: "Обзор шагов модуля",
      };
    }
    return stepLink(prevStep, prefix);
  };

  const toNext = (): LearningStepLink | null => {
    if (!nextStep) return null;
    return stepLink(nextStep, prefix);
  };

  return { previous: toPrev(), next: toNext() };
}
