import "./00-init-prisma-env";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL?.trim()) {
  throw new Error("DATABASE_URL не задан. Укажите строку подключения к PostgreSQL для Prisma.");
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
