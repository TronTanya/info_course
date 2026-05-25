import { describe, expect, it } from "vitest";
import { buildLessonBreadcrumbItems, lessonModuleHref } from "@/lib/lesson-breadcrumbs-ui";
import {
  LESSON_HEADER_STATUS_LABELS,
  buildLessonHeaderStatus,
} from "@/lib/lesson-header-ui";

describe("buildLessonHeaderStatus", () => {
  it("uses stage-4 status labels", () => {
    expect(LESSON_HEADER_STATUS_LABELS.completed).toBe("Завершено");
    expect(LESSON_HEADER_STATUS_LABELS.not_started).toBe("Не начато");
    expect(buildLessonHeaderStatus("in_progress", 0).label).toBe("В процессе");
    expect(buildLessonHeaderStatus("locked", 0).label).toBe("Заблокировано");
  });

  it("shows lockedReason in hint when provided", () => {
    expect(
      buildLessonHeaderStatus("locked", 0, "Сначала пройдите лекцию модуля 1").hint,
    ).toBe("Сначала пройдите лекцию модуля 1");
  });

  it("reflects reading percent for in_progress", () => {
    expect(buildLessonHeaderStatus("in_progress", 40).hint).toContain("40%");
  });
});

describe("buildLessonBreadcrumbItems", () => {
  it("links course and module with dashboard routes", () => {
    const items = buildLessonBreadcrumbItems({
      courseTitle: "Кибербезопасность",
      moduleTitle: "Фишинг",
      moduleId: "mod-2",
      lessonTitle: "Признаки атаки",
    });
    expect(items).toHaveLength(3);
    expect(items[0]?.href).toBe("/dashboard/course");
    expect(items[1]?.href).toBe(lessonModuleHref("mod-2"));
    expect(items[2]?.href).toBeUndefined();
    expect(items[2]?.label).toBe("Признаки атаки");
  });
});
