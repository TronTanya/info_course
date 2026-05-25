import { describe, expect, it } from "vitest";
import {
  buildTestNextLearningStep,
  isPracticeUnlockedAfterTest,
  type TestPageLearningContext,
} from "@/lib/test-next-learning-step";
import { TEST_RESULT_CTA } from "@/lib/test-flow";

function baseContext(overrides: Partial<TestPageLearningContext> = {}): TestPageLearningContext {
  return {
    moduleId: "m1",
    moduleTitle: "Фишинг",
    courseTitle: "Курс",
    courseHref: "/dashboard/course",
    lessonHref: "/dashboard/course/m1/lesson",
    practiceHref: "/dashboard/course/m1/practice",
    moduleHref: "/dashboard/course/m1",
    hasPractice: true,
    practiceRequired: true,
    practiceCompleted: false,
    moduleCompleted: false,
    allModulesComplete: false,
    courseModules: [
      {
        id: "m1",
        orderNumber: 1,
        title: "Фишинг",
        unlocked: true,
        completed: false,
        isCurrent: true,
        href: "/dashboard/course/m1",
      },
      {
        id: "m2",
        orderNumber: 2,
        title: "MFA",
        unlocked: true,
        completed: false,
        isCurrent: false,
        href: "/dashboard/course/m2",
      },
    ],
    relatedLessons: [
      { title: "Повторить материал · Фишинг", href: "/dashboard/course/m1/lesson", type: "lesson" },
    ],
    certificate: null,
    ...overrides,
  };
}

describe("test-next-learning-step", () => {
  it("passed test offers practice CTA on existing route", () => {
    const step = buildTestNextLearningStep(baseContext(), true);
    expect(step.variant).toBe("passed_practice");
    expect(step.headline).toContain("практическая лаборатория");
    expect(step.primaryCta.label).toBe(TEST_RESULT_CTA.practice);
    expect(step.primaryCta.href).toBe("/dashboard/course/m1/practice");
  });

  it("failed test shows review lessons and material CTA", () => {
    const step = buildTestNextLearningStep(baseContext(), false);
    expect(step.variant).toBe("failed_review");
    expect(step.headline).toContain("повторите темы");
    expect(step.primaryCta.label).toBe(TEST_RESULT_CTA.reviewMaterial);
    expect(step.relatedLessons[0]?.href).toBe("/dashboard/course/m1/lesson");
  });

  it("does not unlock practice without pass", () => {
    expect(isPracticeUnlockedAfterTest(baseContext(), false)).toBe(false);
    expect(isPracticeUnlockedAfterTest(baseContext(), true)).toBe(true);
    expect(isPracticeUnlockedAfterTest(baseContext({ practiceRequired: false }), true)).toBe(false);
  });

  it("completed course offers certificate route", () => {
    const step = buildTestNextLearningStep(
      baseContext({
        allModulesComplete: true,
        moduleCompleted: true,
        certificate: {
          issued: false,
          ready: true,
          remainingConditions: 0,
          totalConditions: 4,
          statusLabel: "Готов к выдаче",
          detail: "Все условия выполнены",
          cta: { href: "/dashboard/certificate", label: "К сертификату" },
        },
      }),
      true,
    );
    expect(step.variant).toBe("course_certificate");
    expect(step.primaryCta.href).toBe("/dashboard/certificate");
  });

  it("completed module with next module links to module hub", () => {
    const step = buildTestNextLearningStep(
      baseContext({
        moduleCompleted: true,
        practiceCompleted: true,
        practiceRequired: true,
      }),
      true,
    );
    expect(step.variant).toBe("next_module");
    expect(step.primaryCta.href).toBe("/dashboard/course/m2");
  });
});
