import { describe, expect, it } from "vitest";
import { buildLessonCheckpoints } from "@/lib/lesson-checkpoints";
import {
  buildLessonViewModel,
  extractLessonKeyTerms,
  extractLessonObjectives,
  resolveLessonStatus,
} from "@/lib/lesson-view-mapper";
import type { LearningPageContext } from "@/lib/learning-context";
import { buildModuleHubSteps } from "@/lib/module-hub-steps";
import { getModuleRequirements } from "@/lib/progress";

const CONTENT = `
:::intro
Введение
Понять основы фишинга.
:::

:::definition
Фишинг
Обман с целью получить данные.
:::

:::remember
Запомни
- Не переходить по подозрительным ссылкам
:::

- [ ] Могу назвать признаки фишинга
`;

function minimalLearning(moduleId: string): LearningPageContext {
  const req = getModuleRequirements({
    id: moduleId,
    courseId: "c1",
    orderNumber: 1,
    isActive: true,
    lessons: [{ videoUrl: null }],
    tests: [{ id: "t1" }],
    practicalTasks: [{ id: "p1" }],
  });
  const steps = buildModuleHubSteps(moduleId, true, req, null);
  return {
    courseTitle: "Курс",
    courseProgressPercent: 0,
    modules: [],
    steps: steps.map((s) => ({ ...s, isActive: s.kind === "lecture" })),
    neighbors: {
      previous: { label: "К модулю", href: `/dashboard/course/${moduleId}`, disabled: false },
      next: {
        label: "Тест",
        href: `/dashboard/course/${moduleId}/test`,
        disabled: true,
        hint: "Сначала лекция",
      },
    },
  };
}

describe("lesson-view-mapper", () => {
  it("resolveLessonStatus reflects completion and lock", () => {
    expect(
      resolveLessonStatus({
        moduleUnlocked: true,
        lectureBlocked: false,
        lessonCompleted: true,
        hasProgressRow: true,
      }),
    ).toBe("completed");
    expect(
      resolveLessonStatus({
        moduleUnlocked: false,
        lectureBlocked: false,
        lessonCompleted: false,
        hasProgressRow: false,
      }),
    ).toBe("locked");
    expect(
      resolveLessonStatus({
        moduleUnlocked: true,
        lectureBlocked: false,
        lessonCompleted: false,
        hasProgressRow: false,
      }),
    ).toBe("not_started");
  });

  it("extractLessonObjectives uses intro and remember", () => {
    const objectives = extractLessonObjectives(CONTENT);
    expect(objectives.some((o) => o.text.includes("фишинг"))).toBe(true);
    expect(objectives.some((o) => o.text.includes("ссылк"))).toBe(true);
  });

  it("extractLessonKeyTerms reads definition blocks", () => {
    const terms = extractLessonKeyTerms(CONTENT);
    expect(terms.some((t) => t.term === "Фишинг")).toBe(true);
  });

  it("buildLessonCheckpoints has no correctOptionId", () => {
    const checkpoints = buildLessonCheckpoints(CONTENT, "lesson-1");
    expect(checkpoints.length).toBeGreaterThan(0);
    for (const c of checkpoints) {
      expect("correctOptionId" in c).toBe(false);
      expect(c.options?.length).toBe(2);
    }
  });

  it("buildLessonViewModel maps server access flags", () => {
    const vm = buildLessonViewModel({
      moduleId: "mod-1",
      lesson: { id: "les-1", title: "Фишинг", content: CONTENT },
      moduleTitle: "Модуль 1",
      moduleOrderNumber: 1,
      moduleUnlocked: true,
      lessonCompleted: false,
      hasProgressRow: true,
      learning: minimalLearning("mod-1"),
      access: {
        canMarkComplete: true,
        canAccessTest: false,
        canAccessPractice: false,
      },
    });
    expect(vm.status).toBe("in_progress");
    expect(vm.canMarkComplete).toBe(true);
    expect(vm.canAccessTest).toBe(false);
    expect(vm.estimatedMinutes).toBeGreaterThanOrEqual(1);
    expect(vm.moduleId).toBe("mod-1");
    expect(vm.nextTest?.href).toContain("/test");
    expect(vm.nextTest?.title).toBeTruthy();
    expect("correctOptionId" in (vm.checkpoints[0] ?? {})).toBe(false);
    expect(vm.checkpoints[0]?.options.every((o) => "text" in o && !("correctAnswerId" in o))).toBe(true);
  });
});
