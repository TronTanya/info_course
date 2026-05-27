import type { Metadata } from "next";
import { AdminBreadcrumbs, adminBreadcrumbItems } from "@/components/admin/admin-breadcrumbs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminReviewRatingSummary } from "@/components/admin/admin-review-rating-summary";
import {
  AdminReviewsPagination,
  getReviewsPageSize,
} from "@/components/admin/admin-reviews-pagination";
import { AdminShell } from "@/components/layout/admin-shell";
import { deleteReviewAction, hideReviewAction, publishReviewAction } from "@/lib/actions/admin-reviews";
import { AdminReviewsDesktopTable } from "@/components/admin/admin-reviews-desktop-table";
import { computeReviewRatingStats } from "@/lib/admin-review-rating-stats";
import { getAdminReviewRows } from "@/lib/admin-reviews-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ReviewStars } from "@/components/reviews/review-stars";

export const metadata: Metadata = {
  title: "Отзывы (модерация)",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = getReviewsPageSize();

function truncate(s: string, max: number) {
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

type Props = { searchParams: Promise<{ page?: string }> };

export default async function AdminReviewsPage({ searchParams }: Props) {
  const { page: pageRaw } = await searchParams;
  const pageNum = Math.max(1, parseInt(pageRaw ?? "1", 10) || 1);

  const rows = await getAdminReviewRows();
  const ratingStats = computeReviewRatingStats(rows);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(pageNum, totalPages);
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AdminShell>
      <div className="ce-admin-reviews-page min-w-0 space-y-6">
        <AdminPageHeader
          breadcrumb={<AdminBreadcrumbs items={adminBreadcrumbItems("Отзывы")} />}
          title="Отзывы"
          description="Публикация, снятие с публикации и удаление. На сайте показываются только отзывы с признаком «опубликован»."
        />
        <AdminReviewRatingSummary stats={ratingStats} total={rows.length} />

        <section className="ce-admin-panel rounded-2xl border border-border bg-card shadow-sm">
          <header className="border-b border-border px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-foreground">Все отзывы</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {rows.length === 0 ? "Список пуст" : `${rows.length} записей · по ${PAGE_SIZE} на странице`}
            </p>
          </header>

          {rows.length === 0 ? (
            <EmptyState
              compact
              className="border-0 bg-transparent shadow-none"
              title="Отзывов пока нет"
              description="Когда студенты оставят отзыв в кабинете, он появится здесь для модерации."
            />
          ) : (
            <>
              <div className="divide-y divide-border border-t border-border md:hidden">
                {pageRows.map((r) => (
                  <div key={r.id} className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {r.isPublished ? (
                        <Badge variant="success">Опубликован</Badge>
                      ) : (
                        <Badge variant="warning">Скрыт</Badge>
                      )}
                      <ReviewStars value={r.rating} size="sm" />
                    </div>
                    <p className="font-medium text-foreground">{r.name}</p>
                    <p className="text-sm text-muted-foreground">{r.educationalInstitution}</p>
                    <p className="line-clamp-4 text-sm leading-relaxed text-foreground">{truncate(r.text, 400)}</p>
                    <p className="break-all text-xs text-muted-foreground">{r.userEmail ?? "—"}</p>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {!r.isPublished ? (
                        <form action={publishReviewAction.bind(null, r.id)}>
                          <Button type="submit" variant="primary" size="sm">
                            Опубликовать
                          </Button>
                        </form>
                      ) : (
                        <form action={hideReviewAction.bind(null, r.id)}>
                          <Button type="submit" variant="outline" size="sm">
                            Скрыть
                          </Button>
                        </form>
                      )}
                      <form action={deleteReviewAction.bind(null, r.id)}>
                        <Button type="submit" variant="danger" size="sm">
                          Удалить
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>

              <AdminReviewsDesktopTable
                rows={pageRows.map((r) => ({
                  id: r.id,
                  userEmail: r.userEmail,
                  name: r.name,
                  educationalInstitution: r.educationalInstitution,
                  rating: r.rating,
                  text: r.text,
                  isPublished: r.isPublished,
                  createdAt: r.createdAt.toISOString(),
                }))}
              />

              <AdminReviewsPagination page={page} total={rows.length} />
            </>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
