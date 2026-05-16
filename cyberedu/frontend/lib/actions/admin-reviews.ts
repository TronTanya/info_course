"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";

async function revalidateReviewPaths() {
  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/admin/reviews");
}

export async function publishReviewAction(reviewId: string, _formData: FormData) {
  void _formData;
  await requireAdmin();
  await prisma.review.update({ where: { id: reviewId }, data: { isPublished: true } });
  await revalidateReviewPaths();
}

export async function hideReviewAction(reviewId: string, _formData: FormData) {
  void _formData;
  await requireAdmin();
  await prisma.review.update({ where: { id: reviewId }, data: { isPublished: false } });
  await revalidateReviewPaths();
}

export async function deleteReviewAction(reviewId: string, _formData: FormData) {
  void _formData;
  await requireAdmin();
  await prisma.review.delete({ where: { id: reviewId } });
  await revalidateReviewPaths();
}
