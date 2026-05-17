/**
 * Submit test/practice в production mode: реальный enforceServerActionRateLimit + Redis (mock).
 * Не подменяем rate-limit — только auth/DB.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const redisCounts = new Map<string, number>();

vi.mock("redis", () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    incr: vi.fn(async (key: string) => {
      const next = (redisCounts.get(key) ?? 0) + 1;
      redisCounts.set(key, next);
      return next;
    }),
    pExpire: vi.fn().mockResolvedValue(1),
    pTTL: vi.fn().mockResolvedValue(60_000),
  })),
}));

const authMock = vi.hoisted(() => vi.fn());
const checkTestPrerequisitesMock = vi.hoisted(() => vi.fn());
const guardPracticeSubmissionMock = vi.hoisted(() => vi.fn());

const prismaMock = vi.hoisted(() => ({
  test: { findFirst: vi.fn() },
  question: { findMany: vi.fn() },
  practicalTask: { findUnique: vi.fn() },
  $transaction: vi.fn(),
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
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers({ "x-forwarded-for": "203.0.113.99" })),
}));

import { submitPracticeTextAction } from "@/lib/actions/practice";
import { submitTestAttemptAction } from "@/lib/actions/test";
import { resetRateLimitServiceForTests } from "@/lib/security/rate-limit-service";

const userId = "prod-submit-user";

describe("security/submit actions in production (Redis-backed rate limit)", () => {
  const env = { ...process.env };

  beforeEach(() => {
    redisCounts.clear();
    resetRateLimitServiceForTests();
    process.env.REDIS_URL = "redis://127.0.0.1:6379";
    process.env.ENVIRONMENT = "production";
    process.env.TRUSTED_PROXY = "1";
    authMock.mockResolvedValue({ user: { id: userId } });
    checkTestPrerequisitesMock.mockResolvedValue({ ok: true });
    guardPracticeSubmissionMock.mockResolvedValue({ ok: true, userId });
  });

  afterEach(() => {
    process.env = { ...env };
    resetRateLimitServiceForTests();
    vi.clearAllMocks();
  });

  it("submitTestAttemptAction succeeds under limit in production", async () => {
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
        testAttempt: { create: vi.fn().mockResolvedValue({ id: "a1" }) },
        testAttemptAnswer: { createMany: vi.fn() },
      });
    });

    const result = await submitTestAttemptAction({
      moduleId: "m1",
      testId: "t1",
      answers: [{ questionId: "q1", kind: "text", text: "достаточно длинный ответ для production smoke" }],
    });

    expect(result.ok).toBe(true);
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it("submitTestAttemptAction denies when production limit exceeded (no DB write)", async () => {
    for (let i = 0; i < 40; i++) {
      await submitTestAttemptAction({
        moduleId: "m1",
        testId: "t1",
        answers: [],
      });
    }

    prismaMock.test.findFirst.mockClear();
    prismaMock.$transaction.mockClear();

    const result = await submitTestAttemptAction({
      moduleId: "m1",
      testId: "t1",
      answers: [],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/слишком много отправок теста/i);
    }
    expect(prismaMock.test.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("submitTestAttemptAction fail-closed when Redis unavailable in production", async () => {
    delete process.env.REDIS_URL;
    resetRateLimitServiceForTests();

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

  it("submitPracticeTextAction denies when production practice limit exceeded", async () => {
    prismaMock.practicalTask.findUnique.mockResolvedValue({
      minLength: 5,
      checkType: "MANUAL",
      maxScore: 10,
      expectedAnswerPattern: null,
    });

    for (let i = 0; i < 45; i++) {
      await submitPracticeTextAction({
        moduleId: "m1",
        practicalTaskId: "pt1",
        text: "ответ практики достаточной длины для лимита",
      });
    }

    const result = await submitPracticeTextAction({
      moduleId: "m1",
      practicalTaskId: "pt1",
      text: "ответ практики достаточной длины для лимита",
    });

    expect(result).toHaveProperty("error");
    expect((result as { error: string }).error).toMatch(/слишком много отправок/i);
  });
});
