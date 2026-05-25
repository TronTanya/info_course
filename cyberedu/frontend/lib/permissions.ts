import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import type { Role } from "@prisma/client";
import { ADMIN_ACCESS_DENIED_PATH } from "@/lib/admin-access-paths";
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

/** Только ADMIN (server actions, API handlers, явные вызовы). Иначе — отказ без деталей RBAC. */
export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    redirect(ADMIN_ACCESS_DENIED_PATH);
  }
  return session;
}

/** Учебный контент (dashboard, сертификат): авторизация + роль USER или ADMIN. */
export async function requireStudentAccess(): Promise<Session> {
  const session = await requireAuth();
  if (!isUser(session.user.role)) {
    redirect("/auth/login");
  }
  return session;
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
