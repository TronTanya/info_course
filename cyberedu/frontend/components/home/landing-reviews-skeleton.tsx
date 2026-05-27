import { LandingSection } from "@/components/home/landing-section";

export function LandingReviewsSkeleton() {
  return (
    <LandingSection
      id="reviews"
      eyebrow="Сообщество"
      title="Отзывы студентов"
      description="Загрузка отзывов…"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl border border-border/60 bg-muted/30 motion-reduce:animate-none"
          />
        ))}
      </div>
    </LandingSection>
  );
}
