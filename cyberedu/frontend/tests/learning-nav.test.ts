import { describe, expect, it } from "vitest";
import type { ModuleHubStepView } from "@/lib/module-hub-steps";
import type { CourseProgressModuleRow } from "@/lib/progress";
import {
  buildLearningNavModules,
  getLearningStepNeighbors,
  markActiveLearningSteps,
} from "@/lib/learning-nav";

function moduleRow(over: Partial<CourseProgressModuleRow> & { id?: string }): CourseProgressModuleRow {
  const id = over.id ?? "m1";
  return {
    module: { id, title: `Module ${id}`, description: null, orderNumber: 1 },
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: false,
      practiceRequired: false,
      totalSteps: 1,
    },
    progress: null,
    unlocked: true,
    progressPercent: 0,
    score: 0,
    moduleCompleted: false,
    ...over,
  };
}

function step(over: Partial<ModuleHubStepView>): ModuleHubStepView {
  return {
    kind: "lecture",
    order: 1,
    title: "Лекция",
    description: "",
    status: "available",
    actionHref: "/dashboard/course/m1/lesson",
    ...over,
  };
}

describe("learning-nav", () => {
  it("buildLearningNavModules marks current and locked href", () => {
    const rows = [
      moduleRow({ id: "m1", unlocked: true, moduleCompleted: false }),
      moduleRow({ id: "m2", unlocked: false, module: { id: "m2", title: "M2", description: null, orderNumber: 2 } }),
    ];
    const nav = buildLearningNavModules(rows, "m1");
    expect(nav[0]?.isCurrent).toBe(true);
    expect(nav[0]?.href).toBe("/dashboard/course/m1");
    expect(nav[1]?.href).toBe("/dashboard/course?locked=1");
  });

  it("markActiveLearningSteps highlights lesson path", () => {
    const steps: ModuleHubStepView[] = [
      step({ kind: "lecture", actionHref: "/dashboard/course/m1/lesson" }),
      step({ kind: "test", order: 2, title: "Тест", actionHref: "/dashboard/course/m1/test" }),
    ];
    const marked = markActiveLearningSteps(steps, "/dashboard/course/m1/lesson");
    expect(marked[0]?.isActive).toBe(true);
    expect(marked[1]?.isActive).toBe(false);
  });

  it("getLearningStepNeighbors returns next step when on lecture", () => {
    const steps: ModuleHubStepView[] = [
      step({ kind: "lecture", actionHref: "/dashboard/course/m1/lesson" }),
      step({
        kind: "test",
        order: 2,
        title: "Тест",
        status: "blocked",
        actionHref: "/dashboard/course/m1/test",
      }),
    ];
    const { previous, next } = getLearningStepNeighbors(steps, "m1", "/dashboard/course/m1/lesson");
    expect(previous?.label).toBe("К модулю");
    expect(next?.href).toContain("/test");
  });
});
