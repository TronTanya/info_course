import { describe, expect, it } from "vitest";
import { isStudentQuickNavActive, resolveStudentNavPaths } from "@/lib/nav-resolve";

describe("nav-resolve", () => {
  it("resolves module-scoped test and practice links", () => {
    const paths = resolveStudentNavPaths("/dashboard/course/mod-1/lesson");
    expect(paths.tests).toBe("/dashboard/course/mod-1/test");
    expect(paths.practice).toBe("/dashboard/course/mod-1/practice");
    expect(paths.mentor).toBe("/dashboard/course/mod-1/lesson");
  });

  it("marks active states by section", () => {
    expect(isStudentQuickNavActive("/dashboard/course/mod-1/test", "tests")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/course/mod-1/practice", "practice")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/profile", "profile")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/course/mod-1", "course")).toBe(true);
    expect(isStudentQuickNavActive("/dashboard/course/mod-1/lesson", "course")).toBe(false);
  });
});
