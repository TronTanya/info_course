import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceServerActionRateLimitMock = vi.hoisted(() => vi.fn());
const authMock = vi.hoisted(() => vi.fn());
const checkTestPrerequisitesMock = vi.hoisted(() => vi.fn());
const guardPracticeSubmissionMock = vi.hoisted(() => vi.fn());

const prismaMock = vi.hoisted(() => ({
  test: { findFirst: vi.fn() },
  question: { findMany: vi.fn() },
  testAttempt: { count: vi.fn() },
  practicalTask: { findUnique: vi.fn() },
  submission: { findFirst: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/security/server-action-rate-limit", () => ({
  enforceServerActionRateLimit: enforceServerActionRateLimitMock,
}));

vi.mock("@/lib/auth", () => ({ auth: authMock }));

vi.mock("@/lib/course-progress-guards", () => ({
  checkTestPrerequisites: checkTestPrerequisitesMock,
}));

vi.mock("@/lib/practice-submit-guard", () => ({
  guardPracticeSubmission: guardPracticeSubmissionMock,
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/progress", () => ({ recalculateModuleProgress: vi.fn() }));

vi.mock("@/lib/practice-progress-engine", () => ({
  persistPracticeSubmission: vi.fn(),
  resolveTextAnswerSubmission: vi.fn(() => ({
    kind: "persist",
    status: "SUBMITTED",
    score: null,
    pendingReview: true,
  })),
}));

vi.mock("@/lib/security-log", () => ({ securityLog: vi.fn() }));

import { submitPracticeTextAction } from "@/lib/actions/practice";
import { submitTestAttemptAction } from "@/lib/actions/test";

const userId = "user-submit-rl";

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: userId } });
  enforceServerActionRateLimitMock.mockResolvedValue({ allowed: true });
  checkTestPrerequisitesMock.mockResolvedValue({ ok: true });
  guardPracticeSubmissionMock.mockResolvedValue({ ok: true, userId });
  prismaMock.testAttempt.count.mockResolvedValue(0);
});

describe("submit Server Actions rate limit", () => {
  it("submitTestAttemptAction awaits enforceServerActionRateLimit(testSubmit) before DB", async () => {
    prismaMock.test.findFirst.mockResolvedValue({ id: "t1", minScore: 60 });
    prismaMock.question.findMany.mockResolvedValue([
      {
        id: "q1",
        questionType: "TEXT",
        questionText: "Q?",
        explanation: null,
        answers: [],
      },
    ]);
    prismaMock.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      await fn({
        testAttempt: {
          count: vi.fn().mockResolvedValue(0),
          create: vi.fn().mockResolvedValue({ id: "a1" }),
        },
        testAttemptAnswer: { createMany: vi.fn() },
      });
    });
    prismaMock.testAttempt.count.mockResolvedValue(1);

    await submitTestAttemptAction({
      moduleId: "m1",
      testId: "t1",
      answers: [{ questionId: "q1", kind: "text", text: "достаточно длинный ответ для теста" }],
    });

    expect(enforceServerActionRateLimitMock).toHaveBeenCalledWith(
      "testSubmit",
      userId,
      expect.objectContaining({ exceeded: expect.stringMatching(/теста/i) }),
    );
    expect(checkTestPrerequisitesMock).toHaveBeenCalled();
    expect(prismaMock.test.findFirst).toHaveBeenCalled();
  });

  it("submitTestAttemptAction returns user-facing error when limit exceeded", async () => {
    enforceServerActionRateLimitMock.mockResolvedValue({
      allowed: false,
      error: "Слишком много отправок теста.",
    });

    const result = await submitTestAttemptAction({
      moduleId: "m1",
      testId: "t1",
      answers: [],
    });

    expect(result).toEqual({ ok: false, error: "Слишком много отправок теста." });
    expect(prismaMock.test.findFirst).not.toHaveBeenCalled();
  });

  it("submitTestAttemptAction returns unavailable message when Redis is down", async () => {
    enforceServerActionRateLimitMock.mockResolvedValue({
      allowed: false,
      error: "Сервис временно недоступен. Повторите попытку через несколько минут.",
    });

    const result = await submitTestAttemptAction({
      moduleId: "m1",
      testId: "t1",
      answers: [],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/временно недоступен/i);
    }
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("submitPracticeTextAction awaits enforceServerActionRateLimit(practiceText)", async () => {
    prismaMock.practicalTask.findUnique.mockResolvedValue({
      minLength: 5,
      checkType: "MANUAL",
      maxScore: 10,
      expectedAnswerPattern: null,
    });

    await submitPracticeTextAction({
      moduleId: "m1",
      practicalTaskId: "pt1",
      text: "ответ практики достаточной длины",
    });

    expect(enforceServerActionRateLimitMock).toHaveBeenCalledWith("practiceText", userId);
    expect(guardPracticeSubmissionMock).toHaveBeenCalled();
    expect(prismaMock.practicalTask.findUnique).toHaveBeenCalled();
  });

  it("submitPracticeTextAction returns error when limit exceeded without persisting", async () => {
    enforceServerActionRateLimitMock.mockResolvedValue({
      allowed: false,
      error: "Слишком много отправок. Подождите и попробуйте позже.",
    });

    const result = await submitPracticeTextAction({
      moduleId: "m1",
      practicalTaskId: "pt1",
      text: "ответ практики достаточной длины",
    });

    expect(result).toEqual({ error: "Слишком много отправок. Подождите и попробуйте позже." });
    expect(prismaMock.practicalTask.findUnique).not.toHaveBeenCalled();
  });
});
