import type { Metadata } from "next";
import Link from "next/link";
import { DashboardReviewForm } from "@/components/reviews/dashboard-review-form";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Отзыв о курсе</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            После завершения хотя бы одного модуля вы можете оставить отзыв. Новые отзывы проходят модерацию администратором.
          </p>
        </div>

        {!eligible ? (
          <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Когда завершите первый модуль, здесь появится форма отзыва. Перейдите к{" "}
            <Link href="/dashboard/course" className="font-medium text-primary underline-offset-4 hover:underline">
              курсу
            </Link>
            .
          </p>
        ) : existing ? (
          <div className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-sm">
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
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <DashboardReviewForm />
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
