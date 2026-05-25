import { describe, expect, it } from "vitest";
import {
  buildPracticeNextStepsPanel,
  primaryPracticeNextStepFromPanel,
} from "@/lib/practice-next-step-ui";
import type { PracticePageLearningContext } from "@/lib/practice-next-learning-step";

function learningCtx(overrides: Partial<PracticePageLearningContext> = {}): PracticePageLearningContext {
  return {
    moduleId: "mod-1",
    moduleTitle: "Фишинг",
    courseTitle: "Курс",
    courseHref: "/dashboard/course",
    lessonHref: "/dashboard/course/mod-1/lesson",
    testHref: "/dashboard/course/mod-1/test",
    moduleHref: "/dashboard/course/mod-1",
    moduleCompleted: false,
    practiceCompleted: true,
    allModulesComplete: false,
    courseModules: [
      {
        id: "mod-1",
        title: "Фишинг",
        orderNumber: 1,
        href: "/dashboard/course/mod-1",
        unlocked: true,
        completed: true,
        isCurrent: true,
      },
      {
        id: "mod-2",
        title: "Пароли",
        orderNumber: 2,
        href: "/dashboard/course/mod-2",
        unlocked: true,
        completed: false,
        isCurrent: false,
      },
    ],
    certificate: null,
    ...overrides,
  };
}

describe("buildPracticeNextStepsPanel", () => {
  it("approved: next module and course roadmap", () => {
    const panel = buildPracticeNextStepsPanel({
      status: "approved",
      learning: learningCtx({ moduleCompleted: true }),
      practiceGate: { ok: true },
    });
    expect(panel?.headline).toMatch(/завершён|зачтена/i);
    expect(panel?.actions[0]?.href).toBe("/dashboard/course/mod-2");
    expect(
      panel?.actions.some(
        (a) => a.href === "/dashboard/course" || a.href === "/dashboard/course/mod-1",
      ),
    ).toBe(true);
  });

  it("approved: certificate when course complete", () => {
    const panel = buildPracticeNextStepsPanel({
      status: "approved",
      learning: learningCtx({
        allModulesComplete: true,
        certificate: {
          ready: true,
          issued: false,
          remainingConditions: 0,
          totalConditions: 4,
          statusLabel: "Готов",
          detail: "Оформите сертификат",
          cta: { href: "/dashboard/certificate", label: "К сертификату" },
        },
      }),
      practiceGate: { ok: true },
    });
    expect(panel?.actions[0]?.href).toBe("/dashboard/certificate");
    expect(panel?.actions.some((a) => a.title === "К карте курса")).toBe(true);
  });

  it("pending_review: course and module hub", () => {
    const panel = buildPracticeNextStepsPanel({
      status: "pending_review",
      learning: learningCtx(),
      practiceGate: { ok: true },
    });
    expect(panel?.actions[0]?.title).toBe("Вернуться к курсу");
    expect(panel?.actions[0]?.href).toBe("/dashboard/course");
    expect(panel?.actions[1]?.href).toBe("/dashboard/course/mod-1");
  });

  it("needs_retry: revise, lesson, mentor", () => {
    const panel = buildPracticeNextStepsPanel({
      status: "needs_retry",
      learning: learningCtx(),
      practiceGate: { ok: true },
      canRetry: true,
    });
    expect(panel?.actions.find((a) => a.type === "revise")?.scrollToId).toBe("practice-workspace");
    expect(panel?.actions.some((a) => a.href?.includes("/lesson"))).toBe(true);
    expect(panel?.actions.some((a) => a.mentorActionId === "hint_no_answer")).toBe(true);
  });

  it("locked: routes to test when TEST gate", () => {
    const panel = buildPracticeNextStepsPanel({
      status: "locked",
      learning: learningCtx(),
      practiceGate: { ok: false, code: "TEST", message: "Сначала пройдите тест" },
    });
    expect(panel?.actions[0]?.href).toBe("/dashboard/course/mod-1/test");
    expect(panel?.actions[0]?.title).toMatch(/тест/i);
  });

  it("locked: routes to lesson when LESSON gate", () => {
    const panel = buildPracticeNextStepsPanel({
      status: "locked",
      learning: learningCtx(),
      practiceGate: { ok: false, code: "LESSON", message: "Сначала лекция" },
    });
    expect(panel?.actions[0]?.href).toBe("/dashboard/course/mod-1/lesson");
  });

  it("locked: routes to course when module locked", () => {
    const panel = buildPracticeNextStepsPanel({
      status: "locked",
      learning: learningCtx(),
      practiceGate: { ok: false, code: "MODULE_LOCKED", message: "Модуль закрыт" },
    });
    expect(panel?.actions[0]?.href).toBe("/dashboard/course");
  });

  it("primaryPracticeNextStepFromPanel skips revise without href", () => {
    const panel = buildPracticeNextStepsPanel({
      status: "needs_retry",
      learning: learningCtx(),
      practiceGate: { ok: true },
      canRetry: true,
    });
    const primary = primaryPracticeNextStepFromPanel(panel);
    expect(primary).toBeUndefined();
  });
});
