import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  module: { findUnique: vi.fn(), findFirst: vi.fn() },
  progress: { findUnique: vi.fn(), update: vi.fn(), upsert: vi.fn() },
  testAttempt: { findFirst: vi.fn() },
  submission: { findFirst: vi.fn() },
}));

vi.mock("@/lib/db", () => ({ prisma }));

import { prisma as prismaClient } from "@/lib/db";
import { checkModuleAccessForApi, checkPracticeEntry, checkTestPrerequisites } from "@/lib/course-progress-guards";
import { isModuleUnlocked, recalculateModuleProgress } from "@/lib/progress";

type MockDb = {
  module: { findUnique: ReturnType<typeof vi.fn>; findFirst: ReturnType<typeof vi.fn> };
  progress: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; upsert: ReturnType<typeof vi.fn> };
  testAttempt: { findFirst: ReturnType<typeof vi.fn> };
  submission: { findFirst: ReturnType<typeof vi.fn> };
};

const prismaMock = prismaClient as unknown as MockDb;

const activeModuleShape = {
  id: "m2",
  courseId: "c1",
  orderNumber: 2,
  isActive: true,
  lessons: [{ videoUrl: null as string | null }],
  tests: [{ id: "t1" }],
  practicalTasks: [{ id: "p1" }],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("isModuleUnlocked", () => {
  it("false если модуль не найден или выключен", async () => {
    prismaMock.module.findUnique.mockResolvedValueOnce(null);
    await expect(isModuleUnlocked("u1", "x")).resolves.toBe(false);

    prismaMock.module.findUnique.mockResolvedValueOnce({
      id: "m1",
      courseId: "c1",
      orderNumber: 1,
      isActive: false,
    });
    await expect(isModuleUnlocked("u1", "m1")).resolves.toBe(false);
  });

  it("первый активный модуль курса всегда открыт", async () => {
    prismaMock.module.findUnique.mockResolvedValue({
      id: "m1",
      courseId: "c1",
      orderNumber: 1,
      isActive: true,
    });
    prismaMock.module.findFirst.mockResolvedValueOnce({ id: "m1" });
    await expect(isModuleUnlocked("u1", "m1")).resolves.toBe(true);
  });

  it("следующий модуль закрыт пока предыдущий не завершён", async () => {
    prismaMock.module.findUnique.mockResolvedValue({
      id: "m2",
      courseId: "c1",
      orderNumber: 2,
      isActive: true,
    });
    prismaMock.module.findFirst
      .mockResolvedValueOnce({ id: "m1" })
      .mockResolvedValueOnce({ id: "m1" });
    prismaMock.progress.findUnique.mockResolvedValueOnce({ moduleCompleted: false });
    await expect(isModuleUnlocked("u1", "m2")).resolves.toBe(false);

    prismaMock.module.findUnique.mockResolvedValue({
      id: "m2",
      courseId: "c1",
      orderNumber: 2,
      isActive: true,
    });
    prismaMock.module.findFirst
      .mockResolvedValueOnce({ id: "m1" })
      .mockResolvedValueOnce({ id: "m1" });
    prismaMock.progress.findUnique.mockResolvedValueOnce({ moduleCompleted: true });
    await expect(isModuleUnlocked("u1", "m2")).resolves.toBe(true);
  });
});

describe("checkModuleAccessForApi", () => {
  it("MODULE_INACTIVE для выключенного модуля", async () => {
    prismaMock.module.findUnique.mockResolvedValueOnce({ id: "m1", isActive: false });
    const r = await checkModuleAccessForApi("u1", "m1");
    expect(r).toEqual(
      expect.objectContaining({ ok: false, code: "MODULE_INACTIVE" }),
    );
  });

  it("MODULE_LOCKED если цепочка не пройдена", async () => {
    prismaMock.module.findUnique
      .mockResolvedValueOnce({ id: "m2", isActive: true })
      .mockResolvedValue({
        id: "m2",
        courseId: "c1",
        orderNumber: 2,
        isActive: true,
      });
    prismaMock.module.findFirst
      .mockResolvedValueOnce({ id: "m1" })
      .mockResolvedValueOnce({ id: "m1" });
    prismaMock.progress.findUnique.mockResolvedValueOnce({ moduleCompleted: false });
    const r = await checkModuleAccessForApi("u1", "m2");
    expect(r).toEqual(expect.objectContaining({ ok: false, code: "MODULE_LOCKED" }));
  });
});

describe("checkTestPrerequisites", () => {
  it("LESSON если лекция обязательна и не отмечена", async () => {
    prismaMock.module.findUnique.mockResolvedValue({
      id: "m1",
      courseId: "c1",
      orderNumber: 1,
      isActive: true,
      lessons: [{ videoUrl: null }],
      tests: [{ id: "t1" }],
      practicalTasks: [],
    });
    prismaMock.module.findFirst.mockResolvedValueOnce({ id: "m1" });
    prismaMock.progress.findUnique.mockResolvedValueOnce(null);
    const r = await checkTestPrerequisites("u1", "m1");
    expect(r).toEqual(expect.objectContaining({ ok: false, code: "LESSON" }));
  });

  it("VIDEO если требуется видео", async () => {
    prismaMock.module.findUnique.mockResolvedValue({
      id: "m1",
      courseId: "c1",
      orderNumber: 1,
      isActive: true,
      lessons: [{ videoUrl: "https://v" }],
      tests: [{ id: "t1" }],
      practicalTasks: [],
    });
    prismaMock.module.findFirst.mockResolvedValueOnce({ id: "m1" });
    prismaMock.progress.findUnique.mockResolvedValueOnce({ lessonCompleted: true, videoCompleted: false });
    const r = await checkTestPrerequisites("u1", "m1");
    expect(r).toEqual(expect.objectContaining({ ok: false, code: "VIDEO" }));
  });
});

describe("checkPracticeEntry", () => {
  it("TEST если тесты не пройдены", async () => {
    prismaMock.module.findUnique.mockResolvedValue({
      ...activeModuleShape,
      lessons: [{ videoUrl: null }],
      tests: [{ id: "t1" }],
    });
    prismaMock.module.findFirst
      .mockResolvedValueOnce({ id: "m1" })
      .mockResolvedValueOnce({ id: "m1" });
    prismaMock.progress.findUnique.mockImplementation(
      (args: { where: { userId_moduleId: { moduleId: string } } }) => {
        const mid = args.where.userId_moduleId.moduleId;
        if (mid === "m1") return Promise.resolve({ moduleCompleted: true });
        return Promise.resolve({ lessonCompleted: true, videoCompleted: true });
      },
    );
    prismaMock.testAttempt.findFirst.mockResolvedValue(null);
    const r = await checkPracticeEntry("u1", "m2");
    expect(r).toEqual(expect.objectContaining({ ok: false, code: "TEST" }));
  });
});

describe("recalculateModuleProgress", () => {
  it("null для неактивного модуля", async () => {
    prismaMock.module.findUnique.mockResolvedValueOnce({
      ...activeModuleShape,
      isActive: false,
    });
    await expect(recalculateModuleProgress("u1", "m2")).resolves.toBeNull();
  });

  it("при закрытом модуле не вызывает prisma.progress.update", async () => {
    prismaMock.module.findUnique.mockResolvedValue(activeModuleShape);
    prismaMock.module.findFirst
      .mockResolvedValueOnce({ id: "m1" })
      .mockResolvedValueOnce({ id: "m1" });
    prismaMock.progress.findUnique.mockResolvedValue({ moduleCompleted: false });
    prismaMock.progress.update.mockClear();
    await recalculateModuleProgress("u1", "m2");
    expect(prismaMock.progress.update).not.toHaveBeenCalled();
  });
});
