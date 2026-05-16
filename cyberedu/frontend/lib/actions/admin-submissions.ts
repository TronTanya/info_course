"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SubmissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { updatePracticeStatusAfterAdminReview } from "@/lib/practice-progress-engine";
import { requireAdmin } from "@/lib/permissions";
import { parseReviewSubmissionScore } from "@/lib/submission-review-score";

export type AdminSubmissionReviewState = { error?: string };

const REVIEW_STATUSES = new Set<SubmissionStatus>(["ACCEPTED", "REJECTED", "NEEDS_REVISION"]);

function parseStatus(raw: string): SubmissionStatus | null {
  const v = raw.trim() as SubmissionStatus;
  return REVIEW_STATUSES.has(v) ? v : null;
}

export async function reviewSubmissionAction(
  _prev: AdminSubmissionReviewState | null,
  formData: FormData,
): Promise<AdminSubmissionReviewState> {
  const session = await requireAdmin();

  const submissionId = String(formData.get("submissionId") ?? "").trim();
  if (!submissionId) return { error: "Не указана отправка." };

  const status = parseStatus(String(formData.get("status") ?? ""));
  if (!status) return { error: "Выберите статус: принято, отклонено или на доработку." };

  const adminCommentRaw = String(formData.get("adminComment") ?? "");
  const adminComment = adminCommentRaw.trim() === "" ? null : adminCommentRaw.trim();

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

  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
  revalidatePath(`/admin/users/${sub.userId}`);
  revalidatePath(`/admin/submissions/${submissionId}`);
  revalidatePath(`/dashboard/course/${sub.practicalTask.moduleId}/practice`);
  revalidatePath(`/dashboard/course/${sub.practicalTask.moduleId}`);
  revalidatePath("/dashboard/course");
  revalidatePath("/dashboard/profile");

  redirect(`/admin/submissions/${submissionId}`);
}
