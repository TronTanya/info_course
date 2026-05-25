import Link from "next/link";
import { ReviewStars } from "@/components/reviews/review-stars";
import { LandingSection } from "@/components/home/landing-section";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { LANDING_SECTION_IDS } from "@/lib/landing-content";
import { getPublishedReviews } from "@/lib/reviews";

const MAX_REVIEWS = 4;

export async function LandingReviews() {
  const reviews = await getPublishedReviews(MAX_REVIEWS);

  return (
    <LandingSection
      id={LANDING_SECTION_IDS.reviews}
      eyebrow="Сообщество"
      title="Отзывы студентов"
      description="Публикуются только отзывы после модерации. Оставить свой могут пользователи после первого завершённого модуля."
    >
      {reviews.length === 0 ? (
        <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">Пока нет опубликованных отзывов</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Когда появятся первые оценки, они отобразятся здесь автоматически.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((r) => (
            <SectionCard
              key={r.id}
              variant="default"
              flushTitle
              className="flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="mb-3 h-1 w-full bg-gradient-to-r from-primary via-cyan to-secondary/60" aria-hidden />
              <ReviewStars value={r.rating} />
              <div className="mt-4">
                <p className="font-semibold text-foreground">{r.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                  {r.educationalInstitution}
                </p>
              </div>
              <blockquote className="mt-4 line-clamp-6 flex-1 border-l-2 border-primary/25 pl-3 text-sm leading-relaxed text-muted-foreground">
                {r.text}
              </blockquote>
            </SectionCard>
          ))}
        </div>
      )}

      <div className="flex justify-center pt-2">
        <Button asChild variant="outline" size="lg">
          <Link href="/reviews">Все отзывы</Link>
        </Button>
      </div>
    </LandingSection>
  );
}
