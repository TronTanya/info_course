import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  certificate: { findUnique: vi.fn() },
  course: { findUnique: vi.fn() },
  module: { findMany: vi.fn() },
  progress: { findMany: vi.fn() },
}));

vi.mock("@/lib/db", () => ({ prisma }));

import { prisma as prismaClient } from "@/lib/db";
import { canGenerateCertificate, generateCertificateNumber } from "@/lib/certificate";

type MockDb = {
  certificate: { findUnique: ReturnType<typeof vi.fn> };
  course: { findUnique: ReturnType<typeof vi.fn> };
  module: { findMany: ReturnType<typeof vi.fn> };
  progress: { findMany: ReturnType<typeof vi.fn> };
};

const prismaMock = prismaClient as unknown as MockDb;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("canGenerateCertificate", () => {
  it("false если курс не найден", async () => {
    prismaMock.course.findUnique.mockResolvedValueOnce(null);
    await expect(canGenerateCertificate("u1", "bad")).resolves.toBe(false);
  });

  it("false если не все активные модули завершены", async () => {
    prismaMock.course.findUnique.mockResolvedValueOnce({ id: "c1" });
    prismaMock.module.findMany.mockResolvedValueOnce([
      { id: "m1", title: "A", lessons: [], tests: [], practicalTasks: [] },
      { id: "m2", title: "B", lessons: [], tests: [], practicalTasks: [] },
    ]);
    prismaMock.progress.findMany.mockResolvedValueOnce([{ moduleId: "m1", moduleCompleted: true }]);
    await expect(canGenerateCertificate("u1", "c1")).resolves.toBe(false);
  });

  it("true когда все активные модули завершены", async () => {
    prismaMock.course.findUnique.mockResolvedValueOnce({ id: "c1" });
    prismaMock.module.findMany.mockResolvedValueOnce([
      { id: "m1", title: "A", lessons: [], tests: [], practicalTasks: [] },
      { id: "m2", title: "B", lessons: [], tests: [], practicalTasks: [] },
    ]);
    prismaMock.progress.findMany.mockResolvedValueOnce([
      { moduleId: "m1", moduleCompleted: true },
      { moduleId: "m2", moduleCompleted: true },
    ]);
    await expect(canGenerateCertificate("u1", "c1")).resolves.toBe(true);
  });

  it("false если активных модулей нет", async () => {
    prismaMock.course.findUnique.mockResolvedValueOnce({ id: "c1" });
    prismaMock.module.findMany.mockResolvedValueOnce([]);
    await expect(canGenerateCertificate("u1", "c1")).resolves.toBe(false);
  });
});

describe("generateCertificateNumber", () => {
  it("возвращает уникальный номер CE-ГОД-суффикс", async () => {
    prismaMock.certificate.findUnique.mockResolvedValue(null);
    const n = await generateCertificateNumber();
    const parts = n.split("-");
    expect(parts.length).toBe(3);
    expect(parts[0]).toBe("CE");
    expect(parts[1]).toMatch(/^\d{4}$/);
    expect(parts[2]).toHaveLength(8);
    expect(parts[2]).toMatch(/^[A-Z2-9]+$/);
  });
});
