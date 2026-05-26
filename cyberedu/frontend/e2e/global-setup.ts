import { config as loadEnv } from "dotenv";
import { request } from "@playwright/test";
import { getE2eCredentials } from "./test-credentials";
import { ensureE2eDemoUsersReady } from "./helpers/verification";

loadEnv({ path: ".env", quiet: true });

async function globalSetup(): Promise<void> {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100";

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
      await ensureE2eDemoUsersReady();

      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      const studentEmail = getE2eCredentials("student").email;
      const cert = await prisma.certificate.findFirst({
        where: { user: { email: studentEmail } },
        select: { verificationCode: true },
        orderBy: { issuedAt: "desc" },
      });
      if (cert?.verificationCode) {
        process.env.E2E_CERT_VERIFY_CODE = cert.verificationCode;
      }
      await prisma.$disconnect();
    } catch (e) {
      console.warn("[e2e] Не удалось загрузить verificationCode из БД:", e);
    }
  }

  await ctx.dispose();
}

export default globalSetup;
