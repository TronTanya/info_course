import { describe, expect, it } from "vitest";
import {
  areContentEditorRoutesConfigured,
  buildContentManagementPreviewData,
  CONTENT_MANAGEMENT_UNCONFIGURED_MESSAGE,
  contentManagementDraftsTotal,
} from "@/lib/content-management-preview-logic";

describe("content-management-preview-logic", () => {
  const content = {
    courseTitle: "Кибербезопасность",
    modulesTotal: 5,
    modulesActive: 4,
    lessonsTotal: 12,
    testsTotal: 5,
    practicalTasksTotal: 5,
  };

  it("detects configured admin content routes", () => {
    expect(areContentEditorRoutesConfigured()).toBe(true);
    expect(areContentEditorRoutesConfigured({ modules: null })).toBe(false);
  });

  it("builds preview with counts and CTA hrefs", () => {
    const data = buildContentManagementPreviewData({
      content,
      drafts: { inactiveModules: 1, testsWithoutQuestions: 2 },
    });
    expect(data.counts.modules).toBe(5);
    expect(data.actions.find((a) => a.key === "tests")?.href).toBe("/admin/tests");
    expect(data.actions.find((a) => a.key === "tests")?.label).toBe("Управлять тестами");
    expect(data.drafts).not.toBeNull();
    expect(contentManagementDraftsTotal(data.drafts!)).toBe(3);
  });

  it("omits drafts when none", () => {
    const data = buildContentManagementPreviewData({
      content,
      drafts: { inactiveModules: 0, testsWithoutQuestions: 0 },
    });
    expect(data.drafts).toBeNull();
  });

  it("marks routes unconfigured without admin hrefs", () => {
    const data = buildContentManagementPreviewData({
      content,
      routes: { modules: "", lessons: "", tests: "", practices: "" },
    });
    expect(data.routesConfigured).toBe(false);
    expect(data.actions.every((a) => a.href === null)).toBe(true);
    expect(CONTENT_MANAGEMENT_UNCONFIGURED_MESSAGE).toContain("не настроен");
  });
});
