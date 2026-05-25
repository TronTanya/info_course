import { describe, expect, it } from "vitest";
import {
  buildPracticeLabBreadcrumbs,
  isPracticeSubmitDisabled,
  PRACTICE_VIEW_STATUS_LABELS,
  resolvePracticeLabHeaderCtas,
} from "@/lib/practice-lab-header-ui";
import type { PracticeViewModel } from "@/types/practice-view-model";

function baseView(overrides: Partial<PracticeViewModel> = {}): PracticeViewModel {
  return {
    id: "t1",
    title: "Лаборатория",
    moduleId: "m1",
    moduleTitle: "Фишинг",
    status: "not_started",
    evidenceItems: [],
    instructions: [],
    safeRubric: [],
    hints: [],
    canSubmit: true,
    canRetry: false,
    ...overrides,
  };
}

describe("PRACTICE_VIEW_STATUS_LABELS", () => {
  it("uses spec labels for all statuses", () => {
    expect(PRACTICE_VIEW_STATUS_LABELS.pending_review).toBe("Ожидает проверки");
    expect(PRACTICE_VIEW_STATUS_LABELS.needs_retry).toBe("Нужно доработать");
    expect(PRACTICE_VIEW_STATUS_LABELS.rejected).toBe("Отклонено");
  });
});

describe("buildPracticeLabBreadcrumbs", () => {
  it("builds Курс → Модуль → Практика", () => {
    const items = buildPracticeLabBreadcrumbs({
      courseTitle: "Кибербезопасность",
      courseHref: "/dashboard/course",
      moduleTitle: "Модуль 2",
      moduleHref: "/dashboard/course/m1",
    });
    expect(items).toHaveLength(3);
    expect(items[0]?.label).toBe("Кибербезопасность");
    expect(items[1]?.label).toBe("Модуль 2");
    expect(items[2]?.label).toBe("Практика");
    expect(items[2]?.href).toBeUndefined();
  });
});

describe("resolvePracticeLabHeaderCtas", () => {
  it("shows only course CTA when locked", () => {
    const ctas = resolvePracticeLabHeaderCtas(baseView({ status: "locked", canSubmit: false }), {
      courseHref: "/dashboard/course",
    });
    expect(ctas).toHaveLength(1);
    expect(ctas[0]?.label).toBe("Вернуться к курсу");
    expect(ctas[0]?.variant).toBe("primary");
  });

  it("shows continue for in_progress", () => {
    const ctas = resolvePracticeLabHeaderCtas(baseView({ status: "in_progress" }), {
      courseHref: "/dashboard/course",
      workspaceAnchorId: "ws",
    });
    expect(ctas[0]?.kind).toBe("continue");
    expect(ctas.some((c) => c.kind === "course")).toBe(true);
  });

  it("shows retry for needs_retry", () => {
    const ctas = resolvePracticeLabHeaderCtas(
      baseView({ status: "needs_retry", canRetry: true, canSubmit: false }),
      { courseHref: "/dashboard/course" },
    );
    expect(ctas[0]?.kind).toBe("retry");
  });

  it("shows next step when approved", () => {
    const ctas = resolvePracticeLabHeaderCtas(
      baseView({
        status: "approved",
        canSubmit: false,
        nextStep: { title: "Следующий модуль", href: "/dashboard/course/m2", type: "course" },
      }),
      { courseHref: "/dashboard/course" },
    );
    expect(ctas[0]?.kind).toBe("next");
    expect(ctas[0]?.label).toBe("Следующий шаг");
  });
});

describe("isPracticeSubmitDisabled", () => {
  it("blocks submit when locked or canSubmit false", () => {
    expect(isPracticeSubmitDisabled(baseView({ status: "locked" }))).toBe(true);
    expect(isPracticeSubmitDisabled(baseView({ status: "submitted", canSubmit: false }))).toBe(true);
    expect(isPracticeSubmitDisabled(baseView({ status: "in_progress", canSubmit: true }))).toBe(false);
  });
});
