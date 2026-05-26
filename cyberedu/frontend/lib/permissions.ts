import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isModuleUnlocked } from "@/lib/progress";

export function hasRole(role: Role | undefined, allowed: Role | Role[]) {
  if (!role) return false;
  const list = Array.isArray(allowed) ? allowed : [allowed];
  return list.includes(role);
}

export function isAdmin(role: Role | undefined) {
  return role === "ADMIN";
}

/** Обычный пользователь или админ (доступ к учебному контенту). */
export function isUser(role: Role | undefined) {
  return role === "USER" || role === "ADMIN";
}

/** Требует авторизованную сессию; иначе редирект на страницу входа. */
export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }
  return session;
}

/** Роль из БД (не только JWT) — мгновенный отзыв ADMIN. */
export async function getDbUserRole(userId: string): Promise<Role | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role ?? null;
}

/** Только ADMIN; иначе на главную. */
export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth();
  const role = await getDbUserRole(session.user.id);
  if (role !== "ADMIN") {
    redirect("/");
  }
  return {
    ...session,
    user: {
      ...session.user,
      role,
    },
  };
}

/** Поля пользователя для сессии личного кабинета (без passwordHash и прочих секретов). */
const currentUserSelect = {
  id: true,
  email: true,
  role: true,
  emailVerified: true,
  image: true,
  createdAt: true,
  updatedAt: true,
  profile: true,
} as const;

/** Текущий пользователь из БД с профилем или null. */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: currentUserSelect,
  });
}

/**
 * Доступ к модулю: первый по порядку в курсе всегда доступен;
 * модуль N доступен, если у пользователя завершён модуль N-1 (`moduleCompleted`).
 * @see isModuleUnlocked в `lib/progress.ts`
 */
export async function canAccessModule(userId: string, moduleId: string): Promise<boolean> {
  return isModuleUnlocked(userId, moduleId);
}
