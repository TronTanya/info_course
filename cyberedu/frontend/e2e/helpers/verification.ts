import { createHash, randomBytes } from "node:crypto";
import { config as loadEnv } from "dotenv";
import bcrypt from "bcryptjs";
import { clearLoginAttempts } from "@/lib/security/login-attempts";
import { getE2eCredentials, type E2eRole } from "../test-credentials";

/** IP, с которых NextAuth видит Playwright (см. clientIpFromHeaders → "direct" без TRUSTED_PROXY). */
const E2E_LOGIN_IPS = ["direct", "unknown", "127.0.0.1", "::1"] as const;

const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function resolveDatabaseUrl(): string {
  if (!process.env.DATABASE_URL?.trim()) {
    loadEnv({ path: ".env", quiet: true });
  }
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    throw new Error("DATABASE_URL required for E2E email verification helper (.env or env)");
  }
  return dbUrl;
}

function verifyIdentifier(userId: string): string {
  return `email_verify:${userId}`;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Создаёт свежий токен подтверждения email в БД (только E2E / локальная БД).
 */
const BCRYPT_COST = 12;

/** Синхронизирует пароль seed-учётки в БД (только E2E / test, идемпотентно). */
export async function ensureE2eUserPassword(email: string, passwordPlain: string): Promise<void> {
  resolveDatabaseUrl();

  const normalized = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(passwordPlain, BCRYPT_COST);
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const updated = await prisma.user.updateMany({
      where: { email: normalized },
      data: { passwordHash, emailVerified: new Date() },
    });
    if (updated.count === 0) {
      throw new Error(`E2E: user not found for password sync: ${normalized}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

async function clearE2eLoginLockouts(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await Promise.all(E2E_LOGIN_IPS.map((ip) => clearLoginAttempts(normalized, ip)));
}

/** Сбрасывает Redis rate limit для auth:* по типичным E2E IP (dev-сервер без ENVIRONMENT=test). */
async function clearE2eAuthRateLimits(): Promise<void> {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return;

  const keys = E2E_LOGIN_IPS.flatMap((ip) => [
    `rl:auth:login:ip:${ip}`,
    `rl:auth:credentials:ip:${ip}`,
    `rl:auth:register:ip:${ip}`,
  ]);

  try {
    const redisMod = (await import("redis")) as typeof import("redis");
    const client = redisMod.createClient({ url });
    client.on("error", () => {});
    await client.connect();
    await client.del(keys);
    await client.disconnect();
  } catch {
    /* Redis optional in local E2E */
  }
}

export async function resetServerAuthGuards(emails: string[]): Promise<void> {
  const base = (
    process.env.PLAYWRIGHT_BASE_URL ??
    process.env.AUTH_URL ??
    "http://127.0.0.1:3100"
  ).replace(/\/$/, "");

  try {
    const res = await fetch(`${base}/api/dev/e2e-reset-auth`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ emails }),
    });
    if (!res.ok) {
      console.warn(`[e2e] e2e-reset-auth → ${res.status}`);
    }
  } catch (e) {
    console.warn("[e2e] e2e-reset-auth failed:", e);
  }
}

/** student + admin: verified email, пароль и снятие lockout/rate-limit после прогонов. */
export async function ensureE2eDemoUsersReady(): Promise<void> {
  if (process.env.E2E_USE_SEED_CREDENTIALS !== "1") return;

  const emails = (["student", "admin"] as E2eRole[]).map((role) => getE2eCredentials(role).email);
  await resetServerAuthGuards(emails);
  await clearE2eAuthRateLimits();

  for (const role of ["student", "admin"] as E2eRole[]) {
    const { email, password } = getE2eCredentials(role);
    await ensureE2eUserPassword(email, password);
    await clearE2eLoginLockouts(email);
  }

  await ensureE2eStudentPracticeReady();
}

/** Первый модуль: лекция/тест пройдены — чтобы smoke мог открыть /practice (идемпотентно). */
export async function ensureE2eStudentPracticeReady(): Promise<void> {
  if (process.env.E2E_USE_SEED_CREDENTIALS !== "1") return;
  resolveDatabaseUrl();

  const { email } = getE2eCredentials("student");
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    });
    if (!user) return;

    const mod = await prisma.module.findFirst({
      where: { isActive: true },
      orderBy: { orderNumber: "asc" },
      include: { tests: { select: { id: true } } },
    });
    if (!mod) return;

    await prisma.progress.upsert({
      where: { userId_moduleId: { userId: user.id, moduleId: mod.id } },
      create: {
        userId: user.id,
        moduleId: mod.id,
        lessonCompleted: true,
        videoCompleted: true,
        testCompleted: true,
        practiceCompleted: false,
        moduleCompleted: false,
        score: 0,
      },
      update: {
        lessonCompleted: true,
        videoCompleted: true,
        testCompleted: true,
      },
    });

    for (const test of mod.tests) {
      const passed = await prisma.testAttempt.findFirst({
        where: { userId: user.id, testId: test.id, passed: true },
        select: { id: true },
      });
      if (!passed) {
        await prisma.testAttempt.create({
          data: {
            userId: user.id,
            testId: test.id,
            score: 85,
            maxScore: 100,
            passed: true,
          },
        });
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

/** Создаёт/обновляет неподтверждённого пользователя (обход UI register при rate limit). */
export async function createE2eUnverifiedUser(
  email: string,
  passwordPlain: string,
  displayName = "E2E Verify",
): Promise<void> {
  resolveDatabaseUrl();

  const normalized = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(passwordPlain, BCRYPT_COST);
  const [firstName, ...rest] = displayName.trim().split(/\s+/);
  const lastName = rest.join(" ") || "User";

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const interests = JSON.stringify({ version: 1, tags: ["программирование"], custom: "" });

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email: normalized },
        create: { email: normalized, passwordHash, emailVerified: null, role: "USER" },
        update: { passwordHash, emailVerified: null },
      });

      await tx.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          firstName: firstName || "E2E",
          lastName,
          middleName: null,
          birthDate: new Date("2000-01-01"),
          educationalInstitution: "—",
          city: "—",
          specialty: "—",
          interests,
        },
        update: { firstName: firstName || "E2E", lastName },
      });
    });
  } finally {
    await prisma.$disconnect();
  }
}

/** Помечает email подтверждённым для e2e-учёток (идемпотентно). */
export async function ensureE2eUserEmailVerified(email: string): Promise<void> {
  resolveDatabaseUrl();

  const normalized = email.trim().toLowerCase();
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    await prisma.user.updateMany({
      where: { email: normalized },
      data: { emailVerified: new Date() },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function issueE2eEmailVerificationUrl(
  email: string,
  callbackUrl = "/dashboard/profile",
): Promise<string> {
  resolveDatabaseUrl();

  const normalized = email.trim().toLowerCase();
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true, emailVerified: true },
    });
    if (!user) {
      throw new Error(`E2E: user not found: ${normalized}`);
    }

    const rawToken = randomBytes(32).toString("hex");
    const identifier = verifyIdentifier(user.id);
    const expires = new Date(Date.now() + VERIFY_TOKEN_TTL_MS);

    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: hashToken(rawToken),
        expires,
      },
    });

    const base = (process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100").replace(/\/$/, "");
    const params = new URLSearchParams({
      token: rawToken,
      callbackUrl,
    });
    return `${base}/auth/verify-email?${params.toString()}`;
  } finally {
    await prisma.$disconnect();
  }
}
