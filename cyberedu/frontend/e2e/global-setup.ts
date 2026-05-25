import { request } from "@playwright/test";
import { getE2eCredentials } from "./test-credentials";

async function globalSetup(): Promise<void> {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";

  const ctx = await request.newContext({ baseURL });
  const health = await ctx.get("/api/health");
  if (!health.ok()) {
    throw new Error(`E2E: приложение недоступно (${baseURL}/api/health → ${health.status()})`);
  }

  // Проверка, что учётки резолвятся (без логина пароля в консоль).
  getE2eCredentials("student");
  getE2eCredentials("admin");

  if (process.env.DATABASE_URL?.trim()) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      const studentEmail = getE2eCredentials("student").email;
      const cert = await prisma.certificate.findFirst({
        where: { user: { email: studentEmail } },
        select: { certificateNumber: true },
        orderBy: { issuedAt: "desc" },
      });
      if (cert?.certificateNumber) {
        process.env.E2E_CERT_VERIFY_NUMBER = cert.certificateNumber;
      }
      await prisma.$disconnect();
    } catch (e) {
      console.warn("[e2e] Не удалось загрузить certificateNumber из БД:", e);
    }
  }

  await ctx.dispose();
}

export default globalSetup;
