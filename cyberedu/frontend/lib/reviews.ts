import { prisma } from "@/lib/db";

export type PublishedReviewRow = {
  id: string;
  name: string;
  educationalInstitution: string;
  rating: number;
  text: string;
  createdAt: Date;
};

async function getPrimaryCourseId(): Promise<string | null> {
  const c = await prisma.course.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return c?.id ?? null;
}

/** Опубликованные отзывы (главная, раздел «Отзывы»). При недоступной БД — пустой список. */
export async function getPublishedReviews(limit = 24): Promise<PublishedReviewRow[]> {
  try {
    return await prisma.review.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        educationalInstitution: true,
        rating: true,
        text: true,
        createdAt: true,
      },
    });
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("[getPublishedReviews] БД недоступна или неверный DATABASE_URL — блок отзывов пустой:", msg);
    }
    return [];
  }
}

/** Завершён хотя бы один активный модуль основного курса. */
export async function hasUserCompletedAtLeastOneModule(userId: string): Promise<boolean> {
  const courseId = await getPrimaryCourseId();
  if (!courseId) return false;
  const n = await prisma.progress.count({
    where: {
      userId,
      moduleCompleted: true,
      module: { courseId, isActive: true },
    },
  });
  return n >= 1;
}

export async function getUserReview(userId: string) {
  return prisma.review.findUnique({
    where: { userId },
    select: {
      id: true,
      rating: true,
      text: true,
      isPublished: true,
      createdAt: true,
    },
  });
}

function formatAuthorName(p: { lastName: string; firstName: string; middleName: string | null }): string {
  return [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ");
}

/**
 * Создаёт отзыв пользователя (на модерации). Имя и учебное заведение — из профиля.
 */
export async function createUserReviewRecord(
  userId: string,
  input: { rating: number; text: string },
): Promise<{ ok: true } | { ok: false; code: "NO_PROFILE" | "NO_ELIGIBILITY" | "ALREADY_EXISTS" | "DUPLICATE" }> {
  const existing = await getUserReview(userId);
  if (existing) {
    return { ok: false, code: "ALREADY_EXISTS" };
  }

  const eligible = await hasUserCompletedAtLeastOneModule(userId);
  if (!eligible) {
    return { ok: false, code: "NO_ELIGIBILITY" };
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { lastName: true, firstName: true, middleName: true, educationalInstitution: true },
  });
  if (!profile) {
    return { ok: false, code: "NO_PROFILE" };
  }

  const name = formatAuthorName(profile);
  const educationalInstitution = profile.educationalInstitution.trim() || "—";

  try {
    await prisma.review.create({
      data: {
        userId,
        name,
        educationalInstitution,
        rating: input.rating,
        text: input.text,
        isPublished: false,
      },
    });
    return { ok: true };
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code?: string }).code) : "";
    if (code === "P2002") {
      return { ok: false, code: "DUPLICATE" };
    }
    throw e;
  }
}
