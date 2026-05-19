import { describe, expect, it } from "vitest";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";
import {
  formatTestCount,
  getAfterModulePreview,
  getModuleContentMeta,
  getNextModuleRow,
  getUiStatus,
} from "@/lib/course-path-ui";

function moduleRow(over: Partial<CourseProgressModuleRow> & { id?: string; order?: number }): CourseProgressModuleRow {
  const id = over.id ?? "m1";
  return {
    module: {
      id,
      title: `Module ${id}`,
      description: null,
      orderNumber: over.order ?? (id === "m1" ? 1 : 2),
    },
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: true,
      practiceRequired: true,
      totalSteps: 3,
      ...over.requirements,
    },
    contentCounts: { lessons: 1, tests: 1, practices: 1, ...over.contentCounts },
    progress:
      over.progress ??
      ({
        lessonCompleted: false,
        videoCompleted: false,
        testCompleted: false,
        practiceCompleted: false,
        moduleCompleted: false,
      } as ProgressRow),
    unlocked: over.unlocked ?? true,
    progressPercent: over.progressPercent ?? 0,
    score: over.score ?? 0,
    moduleCompleted: over.moduleCompleted ?? false,
    ...over,
  };
}

describe("course-path-ui", () => {
  it("formatTestCount pluralizes correctly", () => {
    expect(formatTestCount(1)).toBe("1 тест");
    expect(formatTestCount(3)).toBe("3 теста");
    expect(formatTestCount(0)).toBe("без тестов");
  });

  it("getModuleContentMeta exposes counts and labels", () => {
    const meta = getModuleContentMeta(moduleRow({ contentCounts: { lessons: 2, tests: 1, practices: 0 } }));
    expect(meta.lessons).toBe(2);
    expect(meta.testsLabel).toContain("тест");
  });

  it("getUiStatus returns locked when module is locked", () => {
    expect(getUiStatus(moduleRow({ unlocked: false }))).toBe("locked");
  });

  it("getNextModuleRow returns following module", () => {
    const modules = [moduleRow({ id: "m1", order: 1 }), moduleRow({ id: "m2", order: 2 })];
    expect(getNextModuleRow(modules, "m1")?.module.id).toBe("m2");
  });

  it("getAfterModulePreview shows next module when not last", () => {
    const modules = [moduleRow({ id: "m1", order: 1 }), moduleRow({ id: "m2", order: 2 })];
    const preview = getAfterModulePreview(modules, "m1", false);
    expect(preview.kind).toBe("next_module");
    if (preview.kind === "next_module") {
      expect(preview.opensWhenComplete).toBe(true);
      expect(preview.row.module.id).toBe("m2");
    }
  });

  it("getAfterModulePreview points to certificate on last completed module", () => {
    const modules = [moduleRow({ id: "m1", order: 1, moduleCompleted: true })];
    const preview = getAfterModulePreview(modules, "m1", true);
    expect(preview.kind).toBe("certificate");
  });
});
