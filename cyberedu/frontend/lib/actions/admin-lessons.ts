"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";

function revalidateLessonAdmin(moduleId: string, lessonId: string) {
  revalidatePath("/admin/lessons");
  revalidatePath(`/admin/lessons/${lessonId}/edit`);
  revalidatePath(`/admin/modules/${moduleId}/edit`);
  revalidatePath("/dashboard/course");
  revalidatePath(`/dashboard/course/${moduleId}`);
  revalidatePath(`/dashboard/course/${moduleId}/lesson`);
}

export type AdminLessonFormState = { error?: string };

export async function updateLessonAction(
  _prev: AdminLessonFormState | null,
  formData: FormData,
): Promise<AdminLessonFormState> {
  await requireAdmin();
  const lessonId = String(formData.get("lessonId") ?? "").trim();
  if (!lessonId) return { error: "Не указана лекция." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Укажите название лекции." };
  const content = String(formData.get("content") ?? "");
  const videoRaw = String(formData.get("videoUrl") ?? "").trim();
  const videoUrl = videoRaw === "" ? null : videoRaw;
  const allowAiAdaptation =
    formData.get("allowAiAdaptation") === "on" || formData.get("allowAiAdaptation") === "true";

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, moduleId: true },
  });
  if (!lesson) return { error: "Лекция не найдена." };

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { title, content, videoUrl, allowAiAdaptation },
  });

  revalidateLessonAdmin(lesson.moduleId, lessonId);
  redirect(`/admin/lessons/${lessonId}/edit`);
}
