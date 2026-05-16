import type { Metadata } from "next";
import Link from "next/link";
import { ReviewStars } from "@/components/reviews/review-stars";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getPublishedReviews } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Отзывы",
};

export default async function ReviewsPage() {
  const reviews = await getPublishedReviews(48);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Отзывы</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Здесь собраны отзывы выпускников и слушателей курса, прошедшие модерацию.{" "}
          <Link href="/auth/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Зарегистрируйтесь
          </Link>
          , чтобы учиться и при желании оставить свой отзыв после первого завершённого модуля.
        </p>
      </div>
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Пока нет опубликованных отзывов.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {reviews.map((r) => (
            <Card key={r.id} className="border-border/90 bg-card/95 shadow-card">
              <CardHeader className="space-y-3 pb-2">
                <ReviewStars value={r.rating} />
                <div>
                  <p className="font-semibold text-foreground">{r.name}</p>
                  <p className="text-sm text-muted-foreground">{r.educationalInstitution}</p>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <blockquote className="border-l-2 border-primary/30 pl-4 text-sm leading-relaxed text-muted-foreground">
                  {r.text}
                </blockquote>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
