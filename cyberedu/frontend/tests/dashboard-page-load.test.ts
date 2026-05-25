import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/profile-course-stats", () => ({
  getProfileCourseStats: vi.fn(),
}));

vi.mock("@/lib/progress", () => ({
  syncAndGetUserCourseProgress: vi.fn(),
}));

vi.mock("@/lib/achievements", () => ({
  reconcileUserAchievements: vi.fn(),
  getUserAchievementRows: vi.fn(),
  achievementNoticesFromKinds: vi.fn(() => []),
}));

vi.mock("@/lib/ai-config", () => ({
  isAiConfigured: vi.fn(() => true),
}));

import { getProfileCourseStats } from "@/lib/profile-course-stats";
import { syncAndGetUserCourseProgress } from "@/lib/progress";
import { getUserAchievementRows, reconcileUserAchievements } from "@/lib/achievements";
import { loadDashboardPageData } from "@/lib/dashboard-page-load";

const session = {
  user: { id: "u1", name: "Anna", email: "a@test.com", role: "USER" as const },
  expires: "",
};

describe("loadDashboardPageData", () => {
  beforeEach(() => {
    vi.mocked(reconcileUserAchievements).mockResolvedValue([]);
    vi.mocked(getUserAchievementRows).mockResolvedValue([]);
  });

  it("returns unauthorized without session", async () => {
    expect(await loadDashboardPageData(undefined, null)).toEqual({ status: "unauthorized" });
  });

  it("returns empty when stats null", async () => {
    vi.mocked(getProfileCourseStats).mockResolvedValue(null);
    expect(await loadDashboardPageData("u1", session)).toEqual({ status: "empty" });
  });

  it("returns progress error when sync fails", async () => {
    vi.mocked(getProfileCourseStats).mockResolvedValue({
      courseId: "c1",
    } as never);
    vi.mocked(syncAndGetUserCourseProgress).mockResolvedValue(null);
    expect(await loadDashboardPageData("u1", session)).toEqual({ status: "error", kind: "progress" });
  });

  it("returns ok with modules on success", async () => {
    vi.mocked(getProfileCourseStats).mockResolvedValue({
      courseId: "c1",
      courseTitle: "Курс",
    } as never);
    vi.mocked(syncAndGetUserCourseProgress).mockResolvedValue({
      modules: [{ module: { id: "m1" } }],
    } as never);
    const result = await loadDashboardPageData("u1", session);
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.displayName).toBe("Anna");
      expect(result.modules).toHaveLength(1);
    }
  });
});
