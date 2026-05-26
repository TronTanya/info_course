import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => vi.fn());
const enforceServerActionRateLimitMock = vi.hoisted(() => vi.fn());
const runLessonAiPipelineMock = vi.hoisted(() => vi.fn());
const safeParseLessonAiActionMock = vi.hoisted(() => vi.fn());
const getLessonAiSnapshotsMock = vi.hoisted(() => vi.fn());
const parseLessonAiMetaMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: authMock }));
vi.mock("@/lib/security/server-action-rate-limit", () => ({
  enforceServerActionRateLimit: enforceServerActionRateLimitMock,
}));
vi.mock("@/lib/lesson-ai-service", () => ({
  runLessonAiPipeline: runLessonAiPipelineMock,
  safeParseLessonAiAction: safeParseLessonAiActionMock,
  getLessonAiSnapshots: getLessonAiSnapshotsMock,
}));
vi.mock("@/lib/lesson-ai-meta", () => ({
  parseLessonAiMeta: parseLessonAiMetaMock,
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/progress", () => ({ completeLesson: vi.fn() }));
vi.mock("@/lib/course-progress-guards", () => ({
  assertModuleAccess: vi.fn(),
  isProgressAccessError: vi.fn(() => false),
}));

import { regenerateLessonAiAction, runLessonAiAction } from "@/lib/actions/lesson";

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: "u-lesson-rl" } });
  enforceServerActionRateLimitMock.mockResolvedValue({ allowed: true });
  safeParseLessonAiActionMock.mockReturnValue("explain_simple");
  runLessonAiPipelineMock.mockResolvedValue({
    id: "a1",
    adaptedContent: "ok",
    interestsUsed: "{}",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  });
});

describe("lesson AI Server Actions rate limit", () => {
  it("runLessonAiAction enforces aiLessonAdapt rate limit before pipeline", async () => {
    await runLessonAiAction({
      moduleId: "m1",
      lessonId: "l1",
      action: "explain_simple",
    });

    expect(enforceServerActionRateLimitMock).toHaveBeenCalledWith(
      "aiLessonAdapt",
      "u-lesson-rl",
      expect.objectContaining({ exceeded: expect.stringMatching(/AI-запросов/i) }),
    );
    expect(runLessonAiPipelineMock).toHaveBeenCalledTimes(1);
  });

  it("runLessonAiAction returns limit error and does not call pipeline", async () => {
    enforceServerActionRateLimitMock.mockResolvedValue({
      allowed: false,
      error: "Слишком много AI-запросов к лекции. Подождите и попробуйте позже.",
    });

    const result = await runLessonAiAction({
      moduleId: "m1",
      lessonId: "l1",
      action: "explain_simple",
    });

    expect(result).toEqual({
      error: "Слишком много AI-запросов к лекции. Подождите и попробуйте позже.",
    });
    expect(runLessonAiPipelineMock).not.toHaveBeenCalled();
  });

  it("regenerateLessonAiAction is rate-limited via runLessonAiAction path", async () => {
    getLessonAiSnapshotsMock.mockResolvedValue({
      explanation: { interestsUsed: "{\"action\":\"summarize\"}" },
      summary: null,
    });
    parseLessonAiMetaMock.mockReturnValue({ action: "summarize", question: "" });

    await regenerateLessonAiAction({
      moduleId: "m1",
      lessonId: "l1",
      kind: "explanation",
    });

    expect(enforceServerActionRateLimitMock).toHaveBeenCalledWith(
      "aiLessonAdapt",
      "u-lesson-rl",
      expect.any(Object),
    );
    expect(runLessonAiPipelineMock).toHaveBeenCalledTimes(1);
  });
});
