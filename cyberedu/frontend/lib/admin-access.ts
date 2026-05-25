import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { ADMIN_ACCESS_DENIED_PATH } from "@/lib/admin-access-paths";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

export { ADMIN_ACCESS_DENIED_PATH, ADMIN_ACCESS_PUBLIC_PATHS, isAdminAccessPublicPath } from "@/lib/admin-access-paths";

export type AdminAccessStatus = "admin" | "unauthenticated" | "unauthorized";

/**
 * Серверная проверка доступа к защищённым разделам /admin/*.
 * Не загружайте admin-данные до статуса `admin`.
 */
export async function resolveAdminAccess(): Promise<AdminAccessStatus> {
  const session = await auth();
  if (!session?.user?.id) return "unauthenticated";
  if (!isAdmin(session.user.role)) return "unauthorized";
  return "admin";
}

export function sessionIsAdmin(session: Session | null): session is Session & {
  user: Session["user"] & { role: "ADMIN" };
} {
  return Boolean(session?.user?.id && isAdmin(session.user.role));
}

/**
 * Блокирует загрузку admin-данных до подтверждения роли ADMIN.
 * Вызывайте в начале server-only loaders (lib/admin-*).
 */
export async function assertAdminDataAccess(): Promise<Session> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=%2Fadmin");
  }
  if (!isAdmin(session.user.role)) {
    redirect(ADMIN_ACCESS_DENIED_PATH);
  }
  return session;
}
