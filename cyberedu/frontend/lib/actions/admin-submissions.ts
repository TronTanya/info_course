"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mapReviewIntentToStatus } from "@/lib/admin-submission-review-intent";
import { prisma } from "@/lib/db";
import { updatePracticeStatusAfterAdminReview } from "@/lib/practice-progress-engine";
import { requireAdmin } from "@/lib/permissions";
import { logAdminSecurityEvent } from "@/lib/security/audit";
import { SECURITY_ACTIONS } from "@/lib/security/audit-actions";
import { parseReviewSubmissionScore } from "@/lib/submission-review-score";

export type AdminSubmissionReviewState = { error?: string; saved?: boolean };

function revalidateAfterSubmissionReview(
  submissionId: string,
  userId: string,
  moduleId: string,
) {
  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath(`/admin/submissions/${submissionId}`);
  revalidatePath(`/dashboard/course/${moduleId}/practice`);
  revalidatePath(`/dashboard/course/${moduleId}`);
  revalidatePath("/dashboard/course");
  revalidatePath("/dashboard/profile");
}

export async function reviewSubmissionAction(
  _prev: AdminSubmissionReviewState | null,
  formData: FormData,
): Promise<AdminSubmissionReviewState> {
  const session = await requireAdmin();

  const submissionId = String(formData.get("submissionId") ?? "").trim();
  if (!submissionId) return { error: "Не указана отправка." };

  const status = mapReviewIntentToStatus(String(formData.get("intent") ?? ""));
  if (!status) return { error: "Выберите действие: принять, отклонить или отправить на доработку." };

  const adminCommentRaw = String(formData.get("adminComment") ?? "");
  const adminComment = adminCommentRaw.trim() === "" ? null : adminCommentRaw.trim();

  if (status === "NEEDS_REVISION" && !adminComment) {
    return { error: "Для доработки укажите комментарий для студента." };
  }

  const scoreRaw = String(formData.get("score") ?? "").trim();

  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      practicalTask: { select: { id: true, moduleId: true, maxScore: true, title: true } },
    },
  });

  if (!sub) return { error: "Отправка не найдена." };
  if (sub.status === "DRAFT") return { error: "Черновик нельзя проверить." };

  const maxScore = sub.practicalTask.maxScore;

  const parsed = parseReviewSubmissionScore(status, scoreRaw, maxScore);
  if (!parsed.ok) return { error: parsed.error };
  const { score } = parsed;

  await updatePracticeStatusAfterAdminReview({
    submissionId,
    reviewerUserId: session.user.id,
    studentUserId: sub.userId,
    moduleId: sub.practicalTask.moduleId,
    status,
    score,
    adminComment,
  });

  revalidateAfterSubmissionReview(submissionId, sub.userId, sub.practicalTask.moduleId);

  redirect(`/admin/submissions/${submissionId}`);
}

/** Сохраняет комментарий для студента без смены статуса и без audit review. */
export async function saveSubmissionReviewCommentAction(
  _prev: AdminSubmissionReviewState | null,
  formData: FormData,
): Promise<AdminSubmissionReviewState> {
  const session = await requireAdmin();

  const submissionId = String(formData.get("submissionId") ?? "").trim();
  if (!submissionId) return { error: "Не указана отправка." };

  const adminCommentRaw = String(formData.get("adminComment") ?? "");
  const adminComment = adminCommentRaw.trim() === "" ? null : adminCommentRaw.trim();

  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      userId: true,
      status: true,
      practicalTask: { select: { moduleId: true } },
    },
  });

  if (!sub) return { error: "Отправка не найдена." };
  if (sub.status === "DRAFT") return { error: "Черновик нельзя редактировать." };

  await prisma.submission.update({
    where: { id: submissionId },
    data: { adminComment },
  });

  logAdminSecurityEvent(
    session.user.id,
    SECURITY_ACTIONS.ADMIN_PRACTICE_REVIEW,
    submissionId,
    { commentOnly: true },
    { path: "/admin/submissions" },
  );

  revalidateAfterSubmissionReview(
    submissionId,
    sub.userId,
    sub.practicalTask.moduleId,
  );

  return { saved: true };
}
