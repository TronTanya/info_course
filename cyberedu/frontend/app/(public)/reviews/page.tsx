import Link from "next/link";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { PublicReviewsGrid } from "@/components/reviews/public-reviews-grid";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cyber } from "@/lib/design-system/cyber";
import { buildPublicMetadata } from "@/lib/seo/build-page-metadata";
import { getPublishedReviews } from "@/lib/reviews";

export const metadata = buildPublicMetadata({
  title: "Отзывы",
  description: "Отзывы выпускников курса CyberEdu по информационной безопасности.",
  path: "/reviews",
});

export default async function ReviewsPage() {
  const reviews = await getPublishedReviews(48);

  return (
    <div className="space-y-10">
      <ScrollReveal>
        <div className={cyber.pageHeader}>
          <p className="typo-eyebrow text-primary">CyberEdu</p>
          <h1 className="typo-h1 mt-2">Отзывы</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Здесь собраны отзывы выпускников и слушателей курса, прошедшие модерацию.{" "}
            <Link href="/auth/register" className="font-medium text-primary underline-offset-4 hover:underline">
              Зарегистрируйтесь
            </Link>
            , чтобы учиться и при желании оставить свой отзыв после первого завершённого модуля.
          </p>
        </div>
      </ScrollReveal>

      {reviews.length === 0 ? (
        <EmptyState
          title="Пока нет опубликованных отзывов"
          description="Когда студенты оставят отзывы и администратор их опубликует, они появятся здесь."
          action={
            <Button asChild variant="primary">
              <Link href="/auth/register">Начать обучение</Link>
            </Button>
          }
        />
      ) : (
        <PublicReviewsGrid
          reviews={reviews.map((r) => ({
            id: r.id,
            name: r.name,
            educationalInstitution: r.educationalInstitution,
            text: r.text,
            rating: r.rating,
            createdAt: r.createdAt.toISOString(),
          }))}
        />
      )}
    </div>
  );
}
