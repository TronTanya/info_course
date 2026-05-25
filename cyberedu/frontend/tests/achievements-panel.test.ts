import { describe, expect, it } from "vitest";
import type { AchievementRow } from "@/lib/achievements";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievements";
import {
  buildAchievementsPanelView,
  deriveProgressToAchievement,
} from "@/lib/achievements-panel";
import type { ProfileCourseStats } from "@/lib/profile-course-stats";
import type { CourseProgressModuleRow, ProgressRow } from "@/lib/progress";

function achievementRow(over: Partial<AchievementRow> & { kind: AchievementRow["kind"] }): AchievementRow {
  const def = ACHIEVEMENT_CATALOG.find((d) => d.kind === over.kind)!;
  return {
    ...def,
    unlocked: over.unlocked ?? false,
    unlockedAt: over.unlockedAt ?? null,
    ...over,
  };
}

function allRows(unlockedKinds: AchievementRow["kind"][] = []): AchievementRow[] {
  const set = new Set(unlockedKinds);
  return ACHIEVEMENT_CATALOG.map((def) => ({
    ...def,
    unlocked: set.has(def.kind),
    unlockedAt: set.has(def.kind) ? "2026-05-01T00:00:00.000Z" : null,
  }));
}

function baseStats(over: Partial<ProfileCourseStats> = {}): ProfileCourseStats {
  return {
    courseId: "c1",
    courseTitle: "Курс",
    completedModules: 0,
    totalModules: 4,
    progressPercent: 0,
    totalPoints: 0,
    maxPossiblePoints: 100,
    scoreSuccessPercent: 0,
    testsPassedCount: 0,
    allModulesComplete: false,
    certificateIssued: false,
    canGenerateCertificate: false,
    ...over,
  } as ProfileCourseStats;
}

function moduleRow(over: Partial<CourseProgressModuleRow> = {}): CourseProgressModuleRow {
  return {
    module: { id: "m1", title: "M1", description: null, orderNumber: 1, ...over.module },
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: true,
      practiceRequired: true,
      totalSteps: 3,
      ...over.requirements,
    },
    contentCounts: { lessons: 1, tests: 1, practices: 1 },
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
    progressPercent: 0,
    score: 0,
    moduleCompleted: over.moduleCompleted ?? false,
    ...over,
  };
}

describe("achievements-panel", () => {
  it("buildAchievementsPanelView lists only unlocked as earned", () => {
    const view = buildAchievementsPanelView(allRows(["LESSON_STUDIED", "TEST_PASSED"]));
    expect(view.unlocked).toHaveLength(2);
    expect(view.unlocked.every((r) => r.unlocked)).toBe(true);
    expect(view.next?.kind).toBe("FIRST_MODULE_COMPLETE");
    expect(view.next?.unlocked).toBe(false);
  });

  it("deriveProgressToAchievement uses lesson metrics for LESSON_STUDIED", () => {
    const next = achievementRow({ kind: "LESSON_STUDIED", unlocked: false });
    const progress = deriveProgressToAchievement(next, baseStats(), [
      moduleRow({
        progress: {
          lessonCompleted: true,
          videoCompleted: false,
          testCompleted: false,
          practiceCompleted: false,
          moduleCompleted: false,
        } as ProgressRow,
      }),
    ]);
    expect(progress).toEqual({ label: "Лекции изучены", value: 1, max: 1 });
  });

  it("deriveProgressToAchievement returns null for phishing without fake unlock", () => {
    const next = achievementRow({ kind: "PHISHING_PRACTICE_PASSED", unlocked: false });
    expect(deriveProgressToAchievement(next, baseStats(), [moduleRow()])).toBeNull();
  });

  it("deriveProgressToCertificate path uses module counts", () => {
    const next = achievementRow({ kind: "CERTIFICATE_EARNED", unlocked: false });
    const progress = deriveProgressToAchievement(
      next,
      baseStats({ completedModules: 2, totalModules: 4 }),
      [moduleRow()],
    );
    expect(progress).toEqual({ label: "Модули программы", value: 2, max: 4 });
  });

  it("next progress is attached in panel view", () => {
    const rows = allRows([]);
    const view = buildAchievementsPanelView(
      rows,
      baseStats({ completedModules: 0, totalModules: 4 }),
      [moduleRow()],
    );
    expect(view.next?.kind).toBe("FIRST_MODULE_COMPLETE");
    expect(view.nextProgress).toEqual({ label: "Модули завершены", value: 0, max: 1 });
  });
});
