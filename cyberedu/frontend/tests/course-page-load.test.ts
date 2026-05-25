import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/progress", () => ({
  getDefaultCourseForDashboard: vi.fn(),
  syncAndGetUserCourseProgress: vi.fn(),
}));

vi.mock("@/lib/certificate", () => ({
  getCertificateDashboardState: vi.fn(),
}));

vi.mock("@/lib/profile-course-stats", () => ({
  getProfileCourseStats: vi.fn(),
}));

vi.mock("@/lib/log/structured", () => ({
  logError: vi.fn(),
}));

import { logError } from "@/lib/log/structured";
import { getCertificateDashboardState } from "@/lib/certificate";
import { getProfileCourseStats } from "@/lib/profile-course-stats";
import { loadCoursePageData } from "@/lib/course-page-load";
import {
  getDefaultCourseForDashboard,
  syncAndGetUserCourseProgress,
} from "@/lib/progress";

const course = { id: "c1", title: "Курс", description: null };
const progress = {
  courseId: "c1",
  courseTitle: "Курс",
  modules: [],
  overallProgressPercent: 0,
};

describe("loadCoursePageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns course_not_found when no course", async () => {
    vi.mocked(getDefaultCourseForDashboard).mockResolvedValue(null);
    const result = await loadCoursePageData("u1");
    expect(result).toEqual({ status: "empty", kind: "course_not_found" });
  });

  it("returns modules error when course fetch throws", async () => {
    vi.mocked(getDefaultCourseForDashboard).mockRejectedValue(new Error("db"));
    const result = await loadCoursePageData("u1");
    expect(result).toEqual({ status: "error", kind: "modules" });
    expect(logError).toHaveBeenCalledWith(
      "course_page_modules_load_failed",
      expect.objectContaining({ userId: "u1" }),
    );
  });

  it("returns progress error when sync throws", async () => {
    vi.mocked(getDefaultCourseForDashboard).mockResolvedValue(course);
    vi.mocked(syncAndGetUserCourseProgress).mockRejectedValue(new Error("sync"));
    const result = await loadCoursePageData("u1");
    expect(result).toEqual({ status: "error", kind: "progress" });
    expect(logError).toHaveBeenCalledWith(
      "course_page_progress_load_failed",
      expect.objectContaining({ courseId: "c1" }),
    );
  });

  it("returns progress error when sync returns null", async () => {
    vi.mocked(getDefaultCourseForDashboard).mockResolvedValue(course);
    vi.mocked(syncAndGetUserCourseProgress).mockResolvedValue(null);
    const result = await loadCoursePageData("u1");
    expect(result).toEqual({ status: "error", kind: "progress" });
  });

  it("returns ok and still loads when secondary data fails", async () => {
    vi.mocked(getDefaultCourseForDashboard).mockResolvedValue(course);
    vi.mocked(syncAndGetUserCourseProgress).mockResolvedValue(progress as never);
    vi.mocked(getCertificateDashboardState).mockRejectedValue(new Error("cert"));
    vi.mocked(getProfileCourseStats).mockResolvedValue(null);

    const result = await loadCoursePageData("u1");
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.data).toEqual(progress);
      expect(result.certState).toBeNull();
    }
    expect(logError).toHaveBeenCalledWith(
      "course_page_secondary_load_failed",
      expect.objectContaining({ courseId: "c1" }),
    );
  });

  it("returns ok with cert and stats", async () => {
    vi.mocked(getDefaultCourseForDashboard).mockResolvedValue(course);
    vi.mocked(syncAndGetUserCourseProgress).mockResolvedValue(progress as never);
    vi.mocked(getCertificateDashboardState).mockResolvedValue({ canGenerate: false } as never);
    vi.mocked(getProfileCourseStats).mockResolvedValue({ weakTopics: [] } as never);

    const result = await loadCoursePageData("u1");
    expect(result.status).toBe("ok");
  });
});
