"use server";

import type { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { SECURITY_ACTIONS } from "@/lib/security/audit-actions";
import { logAdminSecurityEvent } from "@/lib/security/audit";

export type UpdateUserRoleState = { error?: string; ok?: boolean };

export async function updateUserRoleAction(
  _prev: UpdateUserRoleState | null,
  formData: FormData,
): Promise<UpdateUserRoleState> {
  const session = await requireAdmin();
  const targetUserId = String(formData.get("userId") ?? "").trim();
  const newRoleRaw = String(formData.get("role") ?? "").trim();

  if (!targetUserId) return { error: "Не указан пользователь." };
  if (newRoleRaw !== "USER" && newRoleRaw !== "ADMIN") {
    return { error: "Недопустимая роль." };
  }
  const newRole = newRoleRaw as Role;

  if (targetUserId === session.user.id) {
    return { error: "Нельзя изменить собственную роль." };
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true },
  });
  if (!user) return { error: "Пользователь не найден." };
  if (user.role === newRole) return { ok: true };

  const previousRole = user.role;
  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  logAdminSecurityEvent(session.user.id, SECURITY_ACTIONS.ADMIN_USER_ROLE_CHANGE, targetUserId, {
    previousRole,
    newRole,
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${targetUserId}`);
  return { ok: true };
}
