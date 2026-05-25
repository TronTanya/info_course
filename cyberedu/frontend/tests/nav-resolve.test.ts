import { describe, expect, it } from "vitest";
import { DASHBOARD_MENTOR_PAGE_PATH } from "@/lib/dashboard-ai-widget";
import { isStudentQuickNavActive, resolveStudentNavPaths } from "@/lib/nav-resolve";

describe("nav-resolve", () => {
  it("resolves module-scoped lesson, test and practice links", () => {
    const paths = resolveStudentNavPaths("/dashboard/course/mod-1/lesson");
    expect(paths.lessons).toBe("/dashboard/course/mod-1/lesson");
    expect(paths.tests).toBe("/dashboard/course/mod-1/test");
    expect(paths.practice).toBe("/dashboard/course/mod-1/practice");
    expect(paths.mentor).toBe(DASHBOARD_MENTOR_PAGE_PATH);
  });

  it("uses lastModuleId when URL has no module segment", () => {
    const paths = resolveStudentNavPaths("/dashboard/mentor", { lastModuleId: "mod-2" });
    expect(paths.tests).toBe("/dashboard/course/mod-2/test");
    expect(paths.lessons).toBe("/dashboard/course/mod-2/lesson");
  });

  it("marks active states by section", () => {
    expect(isStudentQuickNavActive("/dashboard/course/mod-1/test", "tests")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/course/mod-1/practice", "practice")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/course/mod-1/lesson", "lessons")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/course/mod-1/lesson", "mentor")).toBe(false);
    expect(isStudentQuickNavActive(DASHBOARD_MENTOR_PAGE_PATH, "mentor")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/profile", "profile")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/course/mod-1", "course")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/course/mod-1/lesson", "course")).toBe(false);
  });
});
