import { describe, expect, it } from "vitest";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";
import { guestCourseNextStepCta, resolveCourseNextStep } from "@/lib/course-next-step";
import { guestAuthLinks } from "@/lib/design-system/nav-config";

function mockProgress(over: Partial<ProgressRow> = {}): ProgressRow {
  return {
    id: "p1",
    userId: "u1",
    moduleId: "m1",
    lessonCompleted: false,
    videoCompleted: false,
    testCompleted: false,
    practiceCompleted: false,
    moduleCompleted: false,
    score: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  };
}

function moduleRow(over: Partial<CourseProgressModuleRow> = {}): CourseProgressModuleRow {
  const { module, requirements, contentCounts, progress, ...rest } = over;
  return {
    module: {
      id: "m1",
      title: "Фишинг",
      description: "Распознавание атак",
      orderNumber: 1,
      ...module,
    },
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: true,
      practiceRequired: true,
      totalSteps: 3,
      ...requirements,
    },
    contentCounts: { lessons: 1, tests: 1, practices: 1, ...contentCounts },
    progress: progress === undefined ? mockProgress() : progress,
    unlocked: rest.unlocked ?? true,
    progressPercent: rest.progressPercent ?? 0,
    score: rest.score ?? 0,
    moduleCompleted: rest.moduleCompleted ?? false,
    ...rest,
  };
}

describe("resolveCourseNextStep", () => {
  it("prioritizes lesson in the current unlocked module", () => {
    const step = resolveCourseNextStep([moduleRow()], null);
    expect(step.kind).toBe("lesson");
    expect(step.href).toBe("/dashboard/course/m1/lesson");
    expect(step.ctaLabel).toBe("Начать урок");
  });

  it("suggests test after lesson is complete", () => {
    const step = resolveCourseNextStep(
      [
        moduleRow({
          progress: mockProgress({ lessonCompleted: true }),
        }),
      ],
      null,
    );
    expect(step.kind).toBe("test");
    expect(step.ctaLabel).toBe("Пройти тест");
    expect(step.href).toBe("/dashboard/course/m1/test");
  });

  it("suggests test retry when there is score but no pass", () => {
    const step = resolveCourseNextStep(
      [
        moduleRow({
          score: 12,
          progress: mockProgress({ lessonCompleted: true, score: 12 }),
        }),
      ],
      null,
    );
    expect(step.kind).toBe("test");
    expect(step.ctaLabel).toBe("Повторить тест");
  });

  it("suggests practice after test", () => {
    const step = resolveCourseNextStep(
      [
        moduleRow({
          progress: mockProgress({ lessonCompleted: true, testCompleted: true }),
        }),
      ],
      null,
    );
    expect(step.kind).toBe("practice");
    expect(step.ctaLabel).toBe("Открыть практику");
  });

  it("skips locked modules and picks the next unlocked one", () => {
    const step = resolveCourseNextStep(
      [
        moduleRow({
          unlocked: false,
          module: { id: "m1", title: "A", description: null, orderNumber: 1 },
        }),
        moduleRow({ module: { id: "m2", title: "B", description: null, orderNumber: 2 } }),
      ],
      null,
    );
    expect(step.href).toBe("/dashboard/course/m2/lesson");
  });

  it("shows certificate when all modules are complete", () => {
    const step = resolveCourseNextStep(
      [
        moduleRow({
          moduleCompleted: true,
          progress: mockProgress({
            lessonCompleted: true,
            testCompleted: true,
            practiceCompleted: true,
            moduleCompleted: true,
          }),
        }),
      ],
      { certificate: null, canGenerate: true },
    );
    expect(step.kind).toBe("certificate");
    expect(step.ctaLabel).toBe("Получить сертификат");
  });

  it("returns empty state when there are no modules", () => {
    const step = resolveCourseNextStep([], null);
    expect(step.empty).toBe(true);
    expect(step.title).toContain("первого модуля");
    expect(step.ctaLabel).toBe("Начать обучение");
  });
});

describe("guestCourseNextStepCta", () => {
  it("points guests to registration", () => {
    const guest = guestCourseNextStepCta();
    expect(guest.href).toBe(guestAuthLinks.register);
    expect(guest.ctaLabel).toBe(guestAuthLinks.registerLabel);
  });
});
