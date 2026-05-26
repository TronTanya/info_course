"use client";

import { useEffect, useState } from "react";
import { publishReviewAction, hideReviewAction, deleteReviewAction } from "@/lib/actions/admin-reviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewStars } from "@/components/reviews/review-stars";

export type AdminReviewRowDto = {
  id: string;
  userEmail: string | null;
  name: string;
  educationalInstitution: string;
  rating: number;
  text: string;
  isPublished: boolean;
  createdAt: string;
};

function truncate(s: string, max: number) {
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

/**
 * Desktop-таблица только после mount — обход дубля DOM от RSC streaming (dev/PPR).
 */
export function AdminReviewsDesktopTable({ rows }: { rows: AdminReviewRowDto[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="ce-admin-reviews-table-wrap hidden min-h-48 md:block"
        data-testid="admin-reviews-table-wrap"
        aria-hidden
      />
    );
  }

  return (
    <div className="ce-admin-reviews-table-wrap hidden md:block" data-testid="admin-reviews-table-wrap">
      <table className="ce-admin-reviews-data w-full min-w-250 border-collapse text-sm">
        <caption className="sr-only">Все отзывы</caption>
        <thead className="sticky top-0 z-10 bg-muted">
          <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="whitespace-nowrap px-4 py-3">Статус</th>
            <th className="whitespace-nowrap px-4 py-3">Оценка</th>
            <th className="min-w-36 px-4 py-3">Автор</th>
            <th className="min-w-40 px-4 py-3">Учебное заведение</th>
            <th className="min-w-48 max-w-xs px-4 py-3">Текст</th>
            <th className="min-w-36 px-4 py-3">Пользователь</th>
            <th className="whitespace-nowrap px-4 py-3">Дата</th>
            <th className="whitespace-nowrap px-4 py-3">Действия</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border/80 bg-card even:bg-muted/25">
              <td className="whitespace-nowrap px-4 py-2.5 align-top">
                {r.isPublished ? (
                  <Badge variant="success">Опубликован</Badge>
                ) : (
                  <Badge variant="warning">Скрыт</Badge>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 align-top">
                <ReviewStars value={r.rating} size="sm" />
              </td>
              <td className="max-w-40 px-4 py-2.5 align-top font-medium text-foreground">{r.name}</td>
              <td className="max-w-44 px-4 py-2.5 align-top text-sm text-muted-foreground">
                <span className="ce-review-text-clamp block">{r.educationalInstitution}</span>
              </td>
              <td className="max-w-xs px-4 py-2.5 align-top text-sm leading-snug text-foreground">
                <span className="ce-review-text-clamp block">{truncate(r.text, 120)}</span>
              </td>
              <td className="max-w-36 break-all px-4 py-2.5 align-top text-xs text-muted-foreground">
                {r.userEmail ?? "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 align-top tabular-nums text-sm text-foreground">
                {new Date(r.createdAt).toLocaleDateString("ru-RU")}
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 align-top">
                <div className="flex flex-wrap gap-2">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
