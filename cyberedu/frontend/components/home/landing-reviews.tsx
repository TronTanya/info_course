import { ReviewStars } from "@/components/reviews/review-stars";
import { SectionCard } from "@/components/ui/section-card";
import { getPublishedReviews } from "@/lib/reviews";

const MAX_REVIEWS = 4;

export async function LandingReviews() {
  const reviews = await getPublishedReviews(MAX_REVIEWS);

  return (
    <section className="ce-section ce-section-stack" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-3xl text-center">
        <p className="ce-eyebrow">Сообщество</p>
        <h2 id="reviews-heading" className="ds-typo-h2 mt-3">
          Отзывы студентов
        </h2>
        <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
          Публикуются только отзывы после модерации. Оставить свой могут пользователи после первого завершённого модуля.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="ce-polish-empty mx-auto max-w-lg px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">Пока нет опубликованных отзывов</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Когда появятся первые оценки, они отобразятся здесь автоматически.
          </p>
        </div>
      ) : (
        <div className="ce-polish-reveal-stagger grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((r) => (
            <SectionCard
              key={r.id}
              variant="accent"
              flushTitle
              className="flex flex-col overflow-hidden"
            >
              <div className="ce-polish-accent-line mb-3" aria-hidden />
              <ReviewStars value={r.rating} />
              <div className="mt-4">
                <p className="font-semibold text-foreground">{r.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">{r.educationalInstitution}</p>
              </div>
              <blockquote className="mt-4 line-clamp-6 flex-1 border-l-2 border-primary/25 pl-3 text-sm leading-relaxed text-muted-foreground">
                {r.text}
              </blockquote>
            </SectionCard>
          ))}
        </div>
      )}
    </section>
  );
}
