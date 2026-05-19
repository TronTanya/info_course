import type { Metadata } from "next";
import { AdminDualTable } from "@/components/admin/admin-dual-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import { AdminShell } from "@/components/layout/admin-shell";
import { deleteReviewAction, hideReviewAction, publishReviewAction } from "@/lib/actions/admin-reviews";
import { AdminReviewRatingStatsPanel } from "@/components/admin/admin-review-rating-stats";
import { computeReviewRatingStats } from "@/lib/admin-review-rating-stats";
import { getAdminReviewRows } from "@/lib/admin-reviews-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ReviewStars } from "@/components/reviews/review-stars";

export const metadata: Metadata = {
  title: "Отзывы (модерация)",
};

function truncate(s: string, max: number) {
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export default async function AdminReviewsPage() {
  const rows = await getAdminReviewRows();
  const ratingStats = computeReviewRatingStats(rows);

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Отзывы"
          description="Публикация, снятие с публикации и удаление. На сайте показываются только отзывы с признаком «опубликован»."
        />
        <AdminReviewRatingStatsPanel stats={ratingStats} total={rows.length} />
        <AdminTableCard title="Все отзывы" description={rows.length === 0 ? "Список пуст" : `${rows.length} записей`}>
            {rows.length === 0 ? (
              <EmptyState
                compact
                className="border-0 bg-transparent shadow-none"
                title="Отзывов пока нет"
                description="Когда студенты оставят отзыв в кабинете, он появится здесь для модерации."
              />
            ) : (
              <AdminDualTable
                mobile={
                  <div className="divide-y divide-border border-t border-border">
                    {rows.map((r) => (
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
                        <p className="text-sm leading-relaxed text-muted-foreground">{truncate(r.text, 400)}</p>
                        <p className="break-all text-xs text-muted-foreground">{r.userEmail ?? "—"}</p>
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                        </p>
                        <div className="flex flex-col gap-2 pt-1">
                          {!r.isPublished ? (
                            <form action={publishReviewAction.bind(null, r.id)}>
                              <Button type="submit" variant="primary" size="sm" className="w-full">
                                Опубликовать
                              </Button>
                            </form>
                          ) : (
                            <form action={hideReviewAction.bind(null, r.id)}>
                              <Button type="submit" variant="outline" size="sm" className="w-full">
                                Скрыть
                              </Button>
                            </form>
                          )}
                          <form action={deleteReviewAction.bind(null, r.id)}>
                            <Button type="submit" variant="danger" size="sm" className="w-full">
                              Удалить
                            </Button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                }
                desktop={
                  <table className="w-full min-w-[960px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3">Статус</th>
                        <th className="px-4 py-3">Оценка</th>
                        <th className="px-4 py-3">Автор</th>
                        <th className="px-4 py-3">Учебное заведение</th>
                        <th className="px-4 py-3">Текст</th>
                        <th className="px-4 py-3">Пользователь</th>
                        <th className="px-4 py-3">Дата</th>
                        <th className="w-56 px-4 py-3">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id} className="border-b border-border/80 align-top hover:bg-muted/40">
                          <td className="px-4 py-3">
                            {r.isPublished ? (
                              <Badge variant="success">Опубликован</Badge>
                            ) : (
                              <Badge variant="warning">Скрыт</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <ReviewStars value={r.rating} size="sm" />
                          </td>
                          <td className="max-w-[160px] px-4 py-3 font-medium text-foreground">{r.name}</td>
                          <td className="max-w-[180px] px-4 py-3 text-muted-foreground">{r.educationalInstitution}</td>
                          <td className="max-w-[280px] px-4 py-3 text-muted-foreground">{truncate(r.text, 220)}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{r.userEmail ?? "—"}</td>
                          <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              {!r.isPublished ? (
                                <form action={publishReviewAction.bind(null, r.id)}>
                                  <Button type="submit" variant="primary" size="sm" className="w-full">
                                    Опубликовать
                                  </Button>
                                </form>
                              ) : (
                                <form action={hideReviewAction.bind(null, r.id)}>
                                  <Button type="submit" variant="outline" size="sm" className="w-full">
                                    Скрыть
                                  </Button>
                                </form>
                              )}
                              <form action={deleteReviewAction.bind(null, r.id)}>
                                <Button type="submit" variant="danger" size="sm" className="w-full">
                                  Удалить
                                </Button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
              />
            )}
        </AdminTableCard>
      </div>
    </AdminShell>
  );
}
