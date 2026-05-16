import { prisma } from "@/lib/db";

export type AdminReviewRow = {
  id: string;
  userId: string | null;
  userEmail: string | null;
  name: string;
  educationalInstitution: string;
  rating: number;
  text: string;
  isPublished: boolean;
  createdAt: Date;
};

export async function getAdminReviewRows(): Promise<AdminReviewRow[]> {
  const rows = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      name: true,
      educationalInstitution: true,
      rating: true,
      text: true,
      isPublished: true,
      createdAt: true,
      user: { select: { email: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userEmail: r.user?.email ?? null,
    name: r.name,
    educationalInstitution: r.educationalInstitution,
    rating: r.rating,
    text: r.text,
    isPublished: r.isPublished,
    createdAt: r.createdAt,
  }));
}
