"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdminAction } from "@/lib/security/admin-action-guard";
import { SECURITY_ACTIONS } from "@/lib/security/audit-actions";
import { logAdminSecurityEvent } from "@/lib/security/audit";

async function revalidateReviewPaths() {
  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/admin/reviews");
}

export async function publishReviewAction(reviewId: string, _formData: FormData) {
  void _formData;
  const session = await requireAdminAction();
  await prisma.review.update({ where: { id: reviewId }, data: { isPublished: true } });
  logAdminSecurityEvent(session.user.id, SECURITY_ACTIONS.ADMIN_CONTENT_PUBLISH, reviewId, {
    resource: "review",
  });
  await revalidateReviewPaths();
}

export async function hideReviewAction(reviewId: string, _formData: FormData) {
  void _formData;
  const session = await requireAdminAction();
  await prisma.review.update({ where: { id: reviewId }, data: { isPublished: false } });
  logAdminSecurityEvent(session.user.id, SECURITY_ACTIONS.ADMIN_CONTENT_UNPUBLISH, reviewId, {
    resource: "review",
  });
  await revalidateReviewPaths();
}

export async function deleteReviewAction(reviewId: string, _formData: FormData) {
  void _formData;
  const session = await requireAdminAction();
  await prisma.review.delete({ where: { id: reviewId } });
  logAdminSecurityEvent(session.user.id, SECURITY_ACTIONS.ADMIN_CONTENT_UNPUBLISH, reviewId, {
    resource: "review",
    deleted: true,
  });
  await revalidateReviewPaths();
}
