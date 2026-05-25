import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    module: { findUnique: vi.fn() },
    progress: { findUnique: vi.fn() },
    lesson: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/lesson-ai-service", () => ({
  getLessonForModulePage: vi.fn(),
  getLessonAiSnapshots: vi.fn(),
}));

vi.mock("@/lib/course-progress-guards", () => ({
  checkModuleAccessForApi: vi.fn(),
  checkTestPrerequisites: vi.fn(),
  checkPracticeEntry: vi.fn(),
}));

vi.mock("@/lib/progress", () => ({
  getDefaultCourseForDashboard: vi.fn(),
  syncAndGetUserCourseProgress: vi.fn(),
  getModuleProgress: vi.fn(),
}));

vi.mock("@/lib/learning-context", () => ({
  buildLearningPageContext: vi.fn(),
}));

vi.mock("@/lib/lesson-view-mapper", () => ({
  buildLessonViewModel: vi.fn(),
}));

vi.mock("@/lib/ai-config", () => ({
  isAiConfigured: vi.fn(() => true),
}));

vi.mock("@/lib/log/structured", () => ({
  logError: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { logError } from "@/lib/log/structured";
import {
  checkModuleAccessForApi,
  checkPracticeEntry,
  checkTestPrerequisites,
} from "@/lib/course-progress-guards";
import { getLessonForModulePage, getLessonAiSnapshots } from "@/lib/lesson-ai-service";
import { buildLearningPageContext } from "@/lib/learning-context";
import { buildLessonViewModel } from "@/lib/lesson-view-mapper";
import { getModuleProgress } from "@/lib/progress";
import { loadLessonPageData } from "@/lib/lesson-page-load";

const moduleRow = { id: "m1", title: "Модуль 1", orderNumber: 1, isActive: true };
const lessonRow = {
  id: "l1",
  title: "Урок",
  content: "## Тема\n\nТекст лекции.",
  videoUrl: null,
  allowAiAdaptation: true,
  moduleId: "m1",
};

describe("loadLessonPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized without userId", async () => {
    const result = await loadLessonPageData(undefined, "m1");
    expect(result).toEqual({ status: "unauthorized" });
  });

  it("returns module_not_found when module inactive", async () => {
    vi.mocked(prisma.module.findUnique).mockResolvedValue({ ...moduleRow, isActive: false } as never);
    const result = await loadLessonPageData("u1", "m1");
    expect(result).toEqual({ status: "empty", kind: "module_not_found" });
  });

  it("returns locked when module access denied", async () => {
    vi.mocked(prisma.module.findUnique).mockResolvedValue(moduleRow as never);
    vi.mocked(checkModuleAccessForApi).mockResolvedValue({
      ok: false,
      code: "MODULE_LOCKED",
      message: "Сначала завершите предыдущий модуль",
    });
    const result = await loadLessonPageData("u1", "m1");
    expect(result.status).toBe("locked");
    if (result.status === "locked") {
      expect(result.moduleTitle).toBe("Модуль 1");
      expect(result.reason).toContain("модул");
    }
  });

  it("returns lesson_not_found when no lesson", async () => {
    vi.mocked(prisma.module.findUnique).mockResolvedValue(moduleRow as never);
    vi.mocked(checkModuleAccessForApi).mockResolvedValue({ ok: true });
    vi.mocked(getLessonForModulePage).mockResolvedValue(null);
    const result = await loadLessonPageData("u1", "m1");
    expect(result).toEqual({ status: "empty", kind: "lesson_not_found" });
  });

  it("returns content_empty when lesson has no body", async () => {
    vi.mocked(prisma.module.findUnique).mockResolvedValue(moduleRow as never);
    vi.mocked(checkModuleAccessForApi).mockResolvedValue({ ok: true });
    vi.mocked(getLessonForModulePage).mockResolvedValue({ ...lessonRow, content: "  " });
    const result = await loadLessonPageData("u1", "m1");
    expect(result).toEqual({
      status: "empty",
      kind: "content_empty",
      moduleTitle: "Модуль 1",
      lessonTitle: "Урок",
    });
  });

  it("returns progress error when getModuleProgress is null", async () => {
    vi.mocked(prisma.module.findUnique).mockResolvedValue(moduleRow as never);
    vi.mocked(checkModuleAccessForApi).mockResolvedValue({ ok: true });
    vi.mocked(getLessonForModulePage).mockResolvedValue(lessonRow as never);
    vi.mocked(prisma.progress.findUnique).mockResolvedValue(null as never);
    vi.mocked(getModuleProgress).mockResolvedValue(null);
    vi.mocked(getLessonAiSnapshots).mockResolvedValue({ explanation: null, summary: null });
    vi.mocked(checkTestPrerequisites).mockResolvedValue({ ok: true });
    vi.mocked(checkPracticeEntry).mockResolvedValue({ ok: true });
    vi.mocked(prisma.lesson.findMany).mockResolvedValue([{ id: "l1" }] as never);

    const result = await loadLessonPageData("u1", "m1");
    expect(result).toEqual({ status: "error", kind: "progress" });
    expect(logError).toHaveBeenCalledWith(
      "lesson_page_progress_empty",
      expect.objectContaining({ moduleId: "m1" }),
    );
  });

  it("returns ok with view when data loads", async () => {
    vi.mocked(prisma.module.findUnique).mockResolvedValue(moduleRow as never);
    vi.mocked(checkModuleAccessForApi).mockResolvedValue({ ok: true });
    vi.mocked(getLessonForModulePage).mockResolvedValue(lessonRow as never);
    vi.mocked(prisma.progress.findUnique).mockResolvedValue({ lessonCompleted: false } as never);
    vi.mocked(getModuleProgress).mockResolvedValue({
      progressPercent: 10,
      requirements: {
        lessonRequired: true,
        videoRequired: false,
        testRequired: true,
        practiceRequired: false,
        totalSteps: 2,
      },
      progress: {
        lessonCompleted: false,
        videoCompleted: false,
        testCompleted: false,
        practiceCompleted: false,
      },
    } as never);
    vi.mocked(getLessonAiSnapshots).mockResolvedValue({ explanation: null, summary: null });
    vi.mocked(checkTestPrerequisites).mockResolvedValue({ ok: false, code: "X", message: "y" });
    vi.mocked(checkPracticeEntry).mockResolvedValue({ ok: true });
    vi.mocked(prisma.lesson.findMany).mockResolvedValue([{ id: "l1" }] as never);
    vi.mocked(buildLearningPageContext).mockResolvedValue({ courseTitle: "Курс" } as never);
    vi.mocked(buildLessonViewModel).mockReturnValue({ id: "l1", title: "Урок" } as never);

    const result = await loadLessonPageData("u1", "m1");
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.data.moduleId).toBe("m1");
      expect(result.data.view.title).toBe("Урок");
    }
  });
});
