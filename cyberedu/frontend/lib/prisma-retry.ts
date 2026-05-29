import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const TRANSIENT_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);

const RETRY_ATTEMPTS = process.env.NODE_ENV === "development" ? 2 : 5;

const CONNECTION_MESSAGE =
  /can't reach database|connection reset|server has closed|econnrefused|etimedout|initialization error|connection pool timeout|timed out fetching a new connection/i;

export function isDbConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return CONNECTION_MESSAGE.test(error.message);
  }
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    TRANSIENT_CODES.has(error.code)
  ) {
    return true;
  }
  if (error instanceof Error && CONNECTION_MESSAGE.test(error.message)) return true;
  return false;
}

/** Повтор при обрыве pooler (типично для Supabase + Windows dev). */
export async function withDbRetry<T>(fn: () => Promise<T>, attempts = RETRY_ATTEMPTS): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      last = error;
      if (!isDbConnectionError(error) || i === attempts - 1) {
        throw error;
      }
      try {
        await prisma.$disconnect();
      } catch {
        /* ignore */
      }
      await new Promise((r) => setTimeout(r, 600 * (i + 1)));
    }
  }
  throw last;
}
