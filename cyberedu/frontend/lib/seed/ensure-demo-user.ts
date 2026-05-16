import bcrypt from "bcryptjs";
import type { Role, User } from "@prisma/client";
import { prisma } from "@/lib/db";

const BCRYPT_COST = 12;

/** Поля обновления существующего пользователя при seed — без passwordHash. */
export function existingUserSeedUpdateFields(params: { role: Role; createdAt: Date }) {
  return {
    role: params.role,
    createdAt: params.createdAt,
  };
}

export function assertSeedAllowed(): void {
  const environment = (process.env.ENVIRONMENT ?? "").trim().toLowerCase();
  const nodeEnv = (process.env.NODE_ENV ?? "").trim().toLowerCase();
  if (environment === "production" || nodeEnv === "production") {
    throw new Error(
      "Prisma seed запрещён в production. Демо-учётки (admin@cyberedu.local и др.) недопустимы. Установите RUN_SEED=0.",
    );
  }
}

export async function hashPasswordForSeed(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export type EnsureDemoUserResult = {
  user: User;
  created: boolean;
  /** true, если пользователь уже был и passwordHash не изменился */
  passwordHashUnchanged: boolean;
};

/**
 * Создаёт демо-пользователя, если его нет. Существующим не меняет passwordHash.
 */
export async function ensureDemoUser(params: {
  email: string;
  role: Role;
  createdAt: Date;
  passwordPlain: string;
}): Promise<EnsureDemoUserResult> {
  const existing = await prisma.user.findUnique({
    where: { email: params.email },
    select: { id: true, passwordHash: true },
  });

  if (existing) {
    const beforeHash = existing.passwordHash;
    const user = await prisma.user.update({
      where: { id: existing.id },
      data: existingUserSeedUpdateFields({
        role: params.role,
        createdAt: params.createdAt,
      }),
    });
    return {
      user,
      created: false,
      passwordHashUnchanged: user.passwordHash === beforeHash,
    };
  }

  const passwordHash = await hashPasswordForSeed(params.passwordPlain);
  const user = await prisma.user.create({
    data: {
      email: params.email,
      passwordHash,
      role: params.role,
      createdAt: params.createdAt,
    },
  });
  return {
    user,
    created: true,
    passwordHashUnchanged: true,
  };
}
