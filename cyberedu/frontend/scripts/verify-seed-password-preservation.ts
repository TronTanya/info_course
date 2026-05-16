#!/usr/bin/env tsx
/**
 * Проверка: повторный ensureDemoUser не меняет passwordHash.
 *
 *   cd frontend
 *   DATABASE_URL="postgresql://..." tsx scripts/verify-seed-password-preservation.ts
 *
 * Требуется доступная БД с применёнными миграциями.
 */
import "../lib/00-init-prisma-env";
import { Role } from "@prisma/client";
import { prisma } from "../lib/db";
import { ensureDemoUser } from "../lib/seed/ensure-demo-user";

const TEST_EMAIL = "seed-verify-password@cyberedu.local";

async function main(): Promise<void> {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } }).catch(() => undefined);

  const first = await ensureDemoUser({
    email: TEST_EMAIL,
    role: Role.USER,
    createdAt: new Date("2026-03-01T10:00:00.000Z"),
    passwordPlain: "FirstPassword123!",
  });

  if (!first.created) {
    throw new Error("Ожидалось создание пользователя на первом шаге");
  }

  const hashAfterFirst = first.user.passwordHash;

  const second = await ensureDemoUser({
    email: TEST_EMAIL,
    role: Role.USER,
    createdAt: new Date("2026-03-02T10:00:00.000Z"),
    passwordPlain: "DifferentPassword456!",
  });

  if (second.created) {
    throw new Error("Повторный вызов не должен создавать нового пользователя");
  }

  if (!second.passwordHashUnchanged) {
    throw new Error("passwordHash изменился при повторном seed");
  }

  if (second.user.passwordHash !== hashAfterFirst) {
    throw new Error("passwordHash в БД отличается от значения после первого seed");
  }

  await prisma.user.delete({ where: { email: TEST_EMAIL } });

  console.log("OK: existing passwordHash preserved on re-seed");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
