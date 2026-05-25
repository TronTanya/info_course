import { describe, expect, it } from "vitest";
import {
  assignLeaderboardRanks,
  sortLeaderboardCandidates,
  type LeaderboardCandidate,
} from "@/lib/leaderboard";

const base = (overrides: Partial<LeaderboardCandidate>): LeaderboardCandidate => ({
  userId: "u1",
  fullName: "А",
  educationalInstitution: null,
  avatarUrl: null,
  initials: "АА",
  progressPercent: 0,
  totalScore: 0,
  completedModules: 0,
  totalModules: 3,
  achievementsUnlocked: 0,
  currentModuleTitle: null,
  ...overrides,
});

describe("leaderboard", () => {
  it("sorts by progress, then score, then achievements, then name", () => {
    const sorted = sortLeaderboardCandidates([
      base({ userId: "a", fullName: "Б", progressPercent: 50, totalScore: 10 }),
      base({ userId: "b", fullName: "А", progressPercent: 50, totalScore: 20 }),
      base({ userId: "c", fullName: "В", progressPercent: 80 }),
      base({ userId: "d", fullName: "Г", progressPercent: 50, totalScore: 20, achievementsUnlocked: 2 }),
    ]);
    expect(sorted.map((r) => r.userId)).toEqual(["c", "d", "b", "a"]);
  });

  it("assigns ranks 1..n", () => {
    const ranked = assignLeaderboardRanks([
      base({ userId: "x", progressPercent: 100 }),
      base({ userId: "y", progressPercent: 10 }),
    ]);
    expect(ranked[0]?.rank).toBe(1);
    expect(ranked[1]?.rank).toBe(2);
  });
});
