import { describe, expect, it } from "vitest";
import type { ModuleRequirements } from "@/lib/progress";
import {
  buildModuleContentListView,
  estimateLessonReadingMinutes,
  formatLessonReadingTime,
} from "@/lib/module-content-list";

function practiceStatusFromBuild(
  locked: boolean,
  practiceCompleted: boolean,
  status: "SUBMITTED" | "CHECKING" | "ACCEPTED" | "REJECTED" | null,
) {
  const view = buildModuleContentListView({
    moduleId: "m1",
    moduleOrderNumber: 2,
    unlocked: !locked,
    requirements: {
      lessonRequired: true,
      videoRequired: false,
      testRequired: true,
      practiceRequired: true,
      totalSteps: 3,
    },
    progress: {
      id: "p1",
      userId: "u1",
      moduleId: "m1",
      lessonCompleted: true,
      videoCompleted: false,
      testCompleted: true,
      practiceCompleted: practiceCompleted,
      moduleCompleted: false,
      score: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    lessons: [],
    tests: [],
    practices: [
      {
        id: "t1",
        title: "Лаборатория",
        taskType: "PHISHING_ANALYSIS",
        maxScore: 10,
        submissionStatus: status,
      },
    ],
  });
  return view.practices[0]?.status;
}

describe("estimateLessonReadingMinutes", () => {
  it("adds time for video", () => {
    const textOnly = estimateLessonReadingMinutes(2000, false);
    const withVideo = estimateLessonReadingMinutes(2000, true);
    expect(withVideo).toBeGreaterThan(textOnly);
  });
});

describe("buildModuleContentListView", () => {
  const req: ModuleRequirements = {
    lessonRequired: true,
    videoRequired: false,
    testRequired: true,
    practiceRequired: true,
    totalSteps: 3,
  };

  it("locks test until lesson is done", () => {
    const view = buildModuleContentListView({
      moduleId: "mod",
      moduleOrderNumber: 1,
      unlocked: true,
      requirements: req,
      progress: null,
      lessons: [{ id: "l1", title: "Введение", contentLength: 3000, hasVideo: false }],
      tests: [{ id: "t1", title: "Контрольный тест", questionCount: 10, lastAttempt: null }],
      practices: [],
    });
    expect(view.lessons[0]?.ctaLabel).toBe("Начать урок");
    expect(view.test?.status).toBe("locked");
    expect(view.test?.ctaDisabled).toBe(true);
  });

  it("offers retry CTA for failed test", () => {
    const view = buildModuleContentListView({
      moduleId: "mod",
      moduleOrderNumber: 1,
      unlocked: true,
      requirements: req,
      progress: {
        id: "p",
        userId: "u",
        moduleId: "mod",
        lessonCompleted: true,
        videoCompleted: false,
        testCompleted: false,
        practiceCompleted: false,
        moduleCompleted: false,
        score: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      lessons: [],
      tests: [{ id: "t1", title: "Тест", questionCount: 5, lastAttempt: { passed: false } }],
      practices: [],
    });
    expect(view.test?.status).toBe("failed");
    expect(view.test?.ctaLabel).toBe("Повторить тест");
    expect(view.test?.questionCountLabel).toBe("5 вопросов");
  });

  it("maps practice pending review", () => {
    expect(practiceStatusFromBuild(false, false, "SUBMITTED")).toBe("submitted");
    expect(practiceStatusFromBuild(false, false, "CHECKING")).toBe("pending_review");
    expect(practiceStatusFromBuild(false, false, "REJECTED")).toBe("needs_retry");
  });
});

describe("formatLessonReadingTime", () => {
  it("formats minutes", () => {
    expect(formatLessonReadingTime(25, false)).toMatch(/25/);
  });
});
