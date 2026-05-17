import { expect } from "@playwright/test";
import { getE2eCredentials } from "../test-credentials";

/** Проверка сохранения попытки теста в PostgreSQL (без mock Redis). */
export async function expectTestAttemptPersistedForStudent(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    throw new Error("DATABASE_URL required for persistence check");
  }

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const email = getE2eCredentials("student").email;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    expect(user?.id).toBeTruthy();

    const count = await prisma.testAttempt.count({
      where: { userId: user!.id },
    });
    expect(count).toBeGreaterThan(0);
  } finally {
    await prisma.$disconnect();
  }
}

/** Проверка TEXT-практики: submission в БД. */
export async function expectPracticeSubmissionPersistedForStudent(
  practicalTaskId?: string,
): Promise<void> {
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    throw new Error("DATABASE_URL required for persistence check");
  }

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    const email = getE2eCredentials("student").email;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    expect(user?.id).toBeTruthy();

    const where = practicalTaskId
      ? { userId: user!.id, practicalTaskId }
      : { userId: user!.id };

    const count = await prisma.submission.count({ where });
    expect(count).toBeGreaterThan(0);
  } finally {
    await prisma.$disconnect();
  }
}
