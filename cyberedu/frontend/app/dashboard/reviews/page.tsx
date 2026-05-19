import type { Metadata } from "next";
import Link from "next/link";
import { DashboardReviewForm } from "@/components/reviews/dashboard-review-form";
import { LearnPageHeader, LearnPageShell } from "@/components/learn/learn-chrome";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui/section-card";
import { getUserReview, hasUserCompletedAtLeastOneModule } from "@/lib/reviews";
import { requireAuth } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Отзыв",
};

export default async function DashboardReviewsPage() {
  const session = await requireAuth();
  const [eligible, existing] = await Promise.all([
    hasUserCompletedAtLeastOneModule(session.user.id),
    getUserReview(session.user.id),
  ]);

  return (
    <DashboardShell>
      <LearnPageShell>
        <LearnPageHeader
          backHref="/dashboard"
          backLabel="← Кабинет"
          eyebrow="Обратная связь"
          title="Отзыв о курсе"
          subtitle="После завершения хотя бы одного модуля вы можете оставить отзыв. Новые отзывы проходят модерацию администратором."
        />

        {!eligible ? (
          <SectionCard variant="lab" className="border-dashed">
            <p className="text-sm text-muted-foreground">
              Когда завершите первый модуль, здесь появится форма отзыва. Перейдите к{" "}
              <Link href="/dashboard/course" className="font-medium text-primary underline-offset-4 hover:underline">
                курсу
              </Link>
              .
            </p>
          </SectionCard>
        ) : existing ? (
          <SectionCard variant="lab" className="space-y-3">
            <p className="text-sm text-muted-foreground">Вы уже отправили отзыв.</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={existing.isPublished ? "success" : "warning"}>
                {existing.isPublished ? "Опубликован" : "На модерации"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Оценка: {existing.rating} из 5 · {new Date(existing.createdAt).toLocaleDateString("ru-RU")}
              </span>
            </div>
            <blockquote className="border-l-2 border-primary/30 pl-4 text-sm text-muted-foreground">{existing.text}</blockquote>
          </SectionCard>
        ) : (
          <SectionCard variant="lab">
            <DashboardReviewForm />
          </SectionCard>
        )}
      </LearnPageShell>
    </DashboardShell>
  );
}
