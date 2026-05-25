import { describe, expect, it } from "vitest";
import type { CourseProgressModuleRow } from "@/lib/progress";
import {
  getModuleCardAction,
  getModuleCardStatus,
  getModuleContentItems,
  getModuleLockReason,
  getModuleSkillLabel,
} from "@/lib/module-card-ui";

function moduleRow(over: Partial<CourseProgressModuleRow> = {}): CourseProgressModuleRow {
  const { module, requirements, contentCounts, ...rest } = over;
  return {
    module: {
      id: "m1",
      title: "Фишинг и социальная инженерия",
      description: "Описание",
      orderNumber: 2,
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
    progress: null,
    unlocked: rest.unlocked ?? true,
    progressPercent: rest.progressPercent ?? 0,
    score: rest.score ?? 0,
    moduleCompleted: rest.moduleCompleted ?? false,
    practicePendingReview: rest.practicePendingReview,
    ...rest,
  };
}

describe("getModuleLockReason", () => {
  it("uses module number in lock message", () => {
    const modules = [
      moduleRow({ module: { id: "m1", title: "A", description: null, orderNumber: 1 }, moduleCompleted: false }),
      moduleRow({ module: { id: "m2", title: "B", description: null, orderNumber: 2 }, unlocked: false }),
    ];
    expect(getModuleLockReason(modules[1]!, modules)).toBe("Завершите модуль 1, чтобы открыть этот.");
  });
});

describe("getModuleCardStatus", () => {
  it("detects pending_review", () => {
    expect(getModuleCardStatus(moduleRow({ practicePendingReview: true }))).toBe("pending_review");
  });

  it("detects completed", () => {
    expect(getModuleCardStatus(moduleRow({ moduleCompleted: true }))).toBe("completed");
  });
});

describe("getModuleCardAction", () => {
  it("returns locked disabled label", () => {
    const row = moduleRow({ unlocked: false });
    const action = getModuleCardAction(row, [row]);
    expect(action.label).toBe("Заблокировано");
    expect(action.disabled).toBe(true);
  });

  it("returns review status CTA", () => {
    const row = moduleRow({
      practicePendingReview: true,
      progress: {
        lessonCompleted: true,
        videoCompleted: false,
        testCompleted: true,
        practiceCompleted: false,
      } as CourseProgressModuleRow["progress"],
    });
    const action = getModuleCardAction(row, [row]);
    expect(action.label).toBe("Посмотреть отправку");
    expect(action.href).toContain("/practice");
  });
});

describe("getModuleContentItems", () => {
  it("lists lesson test practice with statuses", () => {
    const items = getModuleContentItems(moduleRow());
    expect(items.map((i) => i.kind)).toEqual(["lessons", "test", "practice"]);
    expect(items[0]?.statusLabel).toBe("Доступно");
  });
});

describe("getModuleSkillLabel", () => {
  it("maps program module by order", () => {
    const skill = getModuleSkillLabel(moduleRow({ module: { id: "m2", title: "X", description: null, orderNumber: 2 } }));
    expect(skill).toContain("письм");
  });
});
