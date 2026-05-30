import { describe, expect, it } from "vitest";
import { isStudentQuickNavActive, resolveStudentNavPaths } from "@/lib/nav-resolve";

describe("nav-resolve", () => {
  it("resolves module-scoped lesson, test and practice links", () => {
    const paths = resolveStudentNavPaths("/dashboard/course/mod-1/lesson");
    expect(paths.lessons).toBe("/dashboard/course/mod-1/lesson");
    expect(paths.tests).toBe("/dashboard/course/mod-1/test");
    expect(paths.practice).toBe("/dashboard/course/mod-1/practice");
    expect(paths.mentor).toBe("/dashboard/course/mod-1/lesson");
  });

  it("uses last-open module when pathname has no module segment", () => {
    const paths = resolveStudentNavPaths("/dashboard", "mod-9");
    expect(paths.lessons).toBe("/dashboard/course/mod-9/lesson");
    expect(paths.tests).toBe("/dashboard/course/mod-9/test");
    expect(paths.practice).toBe("/dashboard/course/mod-9/practice");
  });

  it("falls back to server continue routes without module context", () => {
    const paths = resolveStudentNavPaths("/dashboard/profile");
    expect(paths.lessons).toBe("/dashboard/continue/lesson");
    expect(paths.tests).toBe("/dashboard/continue/test");
  });

  it("marks active states by section", () => {
    expect(isStudentQuickNavActive("/dashboard/course/mod-1/test", "tests")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/course/mod-1/practice", "practice")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/course/mod-1/lesson", "lessons")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/course/mod-1/lesson", "mentor")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/profile", "profile")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/course/mod-1", "course")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/course/mod-1/lesson", "course")).toBe(false);
  });
});
