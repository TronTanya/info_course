"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";

const TEMP_ORDER = 2_000_000;

async function primaryCourseId(): Promise<string | null> {
  const c = await prisma.course.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  return c?.id ?? null;
}

function revalidateAdminAndDashboard() {
  revalidatePath("/admin/modules");
  revalidatePath("/admin/lessons");
  revalidatePath("/dashboard/course");
}

async function applyModuleOrder(courseId: string, orderedIds: string[]) {
  const existing = await prisma.module.findMany({
    where: { courseId },
    select: { id: true },
  });
  if (existing.length !== orderedIds.length) {
    throw new Error("INVALID_ORDER");
  }
  const set = new Set(existing.map((e) => e.id));
  for (const id of orderedIds) {
    if (!set.has(id)) throw new Error("INVALID_ORDER");
  }

  await prisma.$transaction(async (tx) => {
    let i = 0;
    for (const id of orderedIds) {
      await tx.module.update({
        where: { id },
        data: { orderNumber: TEMP_ORDER + i++ },
      });
    }
    let n = 1;
    for (const id of orderedIds) {
      await tx.module.update({
        where: { id },
        data: { orderNumber: n++ },
      });
    }
  });
}

async function reorderModuleToPositionInternal(moduleId: string, position: number) {
  const m = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!m) return { error: "Модуль не найден." } as const;
  const mods = await prisma.module.findMany({
    where: { courseId: m.courseId },
    orderBy: { orderNumber: "asc" },
    select: { id: true },
  });
  const ids = mods.map((x) => x.id);
  const from = ids.indexOf(moduleId);
  if (from === -1) return { error: "Модуль не найден." } as const;
  const to = Math.min(Math.max(1, position), ids.length) - 1;
  const next = [...ids];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  await applyModuleOrder(m.courseId, next);
  return { ok: true } as const;
}

export type AdminModuleFormState = { error?: string };

export async function createModuleAction(
  _prev: AdminModuleFormState | null,
  formData: FormData,
): Promise<AdminModuleFormState> {
  await requireAdmin();
  const courseId = await primaryCourseId();
  if (!courseId) return { error: "Курс не найден в системе." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Укажите название модуля." };
  const description = String(formData.get("description") ?? "").trim() || null;
  const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

  const maxRow = await prisma.module.aggregate({
    where: { courseId },
    _max: { orderNumber: true },
  });
  const orderNumber = (maxRow._max.orderNumber ?? 0) + 1;

  await prisma.module.create({
    data: { courseId, title, description, orderNumber, isActive },
  });

  revalidateAdminAndDashboard();
  redirect("/admin/modules");
}

export async function updateModuleAction(
  _prev: AdminModuleFormState | null,
  formData: FormData,
): Promise<AdminModuleFormState> {
  await requireAdmin();
  const moduleId = String(formData.get("moduleId") ?? "").trim();
  if (!moduleId) return { error: "Не указан модуль." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Укажите название модуля." };
  const description = String(formData.get("description") ?? "").trim() || null;
  const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";
  const positionRaw = formData.get("orderPosition");
  const position =
    positionRaw !== null && String(positionRaw).trim() !== ""
      ? parseInt(String(positionRaw), 10)
      : NaN;

  const m = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!m) return { error: "Модуль не найден." };

  await prisma.module.update({
    where: { id: moduleId },
    data: { title, description, isActive },
  });

  if (!Number.isNaN(position) && position >= 1) {
    const r = await reorderModuleToPositionInternal(moduleId, position);
    if ("error" in r) return { error: r.error };
  }

  revalidateAdminAndDashboard();
  redirect(`/admin/modules/${moduleId}/edit`);
}

export async function moveModuleAction(
  moduleId: string,
  direction: "up" | "down",
): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  const m = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!m) return { error: "Модуль не найден." };

  const neighbor = await prisma.module.findFirst({
    where: {
      courseId: m.courseId,
      orderNumber: direction === "up" ? m.orderNumber - 1 : m.orderNumber + 1,
    },
  });
  if (!neighbor) {
    revalidateAdminAndDashboard();
    return { ok: true };
  }

  await prisma.$transaction(async (tx) => {
    await tx.module.update({ where: { id: m.id }, data: { orderNumber: TEMP_ORDER } });
    await tx.module.update({ where: { id: neighbor.id }, data: { orderNumber: m.orderNumber } });
    await tx.module.update({ where: { id: m.id }, data: { orderNumber: neighbor.orderNumber } });
  });

  revalidateAdminAndDashboard();
  return { ok: true };
}

export async function toggleModuleActiveAction(moduleId: string) {
  await requireAdmin();
  const m = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!m) return;
  await prisma.module.update({
    where: { id: moduleId },
    data: { isActive: !m.isActive },
  });
  revalidateAdminAndDashboard();
}

export async function deleteModuleAction(moduleId: string): Promise<{ ok?: boolean; error?: string }> {
  await requireAdmin();
  const n = await prisma.progress.count({ where: { moduleId } });
  if (n > 0) {
    return {
      error: "Нельзя удалить модуль: есть записи прогресса пользователей по этому модулю.",
    };
  }
  await prisma.module.delete({ where: { id: moduleId } });
  revalidateAdminAndDashboard();
  return { ok: true };
}

export async function createLessonForModuleAction(moduleId: string) {
  await requireAdmin();
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) {
    redirect("/admin/modules");
  }
  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title: "Новая лекция",
      content: "",
      videoUrl: null,
      allowAiAdaptation: true,
    },
  });
  revalidateAdminAndDashboard();
  revalidatePath(`/dashboard/course/${moduleId}`);
  redirect(`/admin/lessons/${lesson.id}/edit`);
}
