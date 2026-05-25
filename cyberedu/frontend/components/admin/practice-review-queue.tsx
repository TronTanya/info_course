"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, Search } from "lucide-react";
import {
  filterPracticeReviewItems,
  PRACTICE_REVIEW_FILTER_OPTIONS,
  practiceReviewFilterListHref,
  searchPracticeReviewItems,
  statusBadgeVariant,
  type PracticeReviewFilterId,
  type PracticeReviewQueueItem,
} from "@/lib/practice-review-queue-logic";
import { AdminResponsiveFilters } from "@/components/admin/admin-responsive-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminEmptyState } from "@/components/admin/admin-states";
import { EmptyState } from "@/components/ui/empty-state";
import { focusRing } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

function formatSubmittedAt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function QueueRow({ item }: { item: PracticeReviewQueueItem }) {
  return (
    <li>
      <article className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card/60 p-3 transition-colors hover:border-primary/25 hover:bg-primary/5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="wrap-break-word font-medium text-foreground">{item.studentLabel}</p>
          <p className="wrap-break-word text-sm text-foreground">{item.practiceTitle}</p>
          <p className="text-xs text-muted-foreground">{item.moduleTitle}</p>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <Badge variant={statusBadgeVariant(item.status)}>{item.statusLabel}</Badge>
            <time className="text-[11px] tabular-nums text-muted-foreground" dateTime={item.submittedAt}>
              {formatSubmittedAt(item.submittedAt)}
            </time>
          </div>
        </div>
        <Button asChild size="sm" variant="secondary" className="ce-touch-target min-h-11 w-full shrink-0 sm:w-auto">
          <Link href={item.reviewHref}>Проверить</Link>
        </Button>
      </article>
    </li>
  );
}

export function PracticeReviewQueue({
  items,
  pageSize = 8,
  showAllHref,
  pendingCount,
  className,
  title = "Очередь проверки практик",
  description = "Краткий обзор без текста ответов и комментариев проверяющего — детали на странице проверки.",
}: {
  items: PracticeReviewQueueItem[];
  pageSize?: number;
  /** Ссылка «Показать все»; по умолчанию — список с текущим фильтром. */
  showAllHref?: string;
  pendingCount?: number;
  className?: string;
  title?: string;
  description?: string;
}) {
  const [filter, setFilter] = useState<PracticeReviewFilterId>("pending_review");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const byStatus = filterPracticeReviewItems(items, filter);
    return searchPracticeReviewItems(byStatus, search);
  }, [items, filter, search]);

  const visible = filtered.slice(0, pageSize);
  const hasMore = filtered.length > pageSize;
  const allHref = showAllHref ?? practiceReviewFilterListHref(filter);

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <ClipboardList className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {pendingCount != null && pendingCount > 0 ? (
          <Badge variant="warning" className="shrink-0">
            <span className="sr-only">В очереди: </span>
            {pendingCount}
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 min-w-0">
        <AdminResponsiveFilters label="Фильтр и поиск">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Фильтр очереди практик">
            {PRACTICE_REVIEW_FILTER_OPTIONS.map((opt) => {
              const active = filter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(opt.id)}
                  className={cn(
                    "min-h-11 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/30"
                      : "border border-border/80 bg-card/80 text-foreground hover:border-primary/30 hover:bg-primary/5",
                    focusRing,
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="relative min-w-0">
            <label htmlFor="practice-review-search" className="sr-only">
              Поиск по студенту или практике
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              id="practice-review-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Студент или практика…"
              className={cn(
                "h-11 min-h-11 w-full rounded-xl border border-border/80 bg-background/90 pl-9 pr-3 text-sm",
                "placeholder:text-muted-foreground",
                focusRing,
              )}
            />
          </div>
        </AdminResponsiveFilters>
      </div>

      {search.trim() && filtered.length === 0 ? (
        <EmptyState
          className="mt-4 py-8"
          compact
          title="Ничего не найдено"
          description="Измените запрос или фильтр."
        />
      ) : filtered.length === 0 ? (
        <AdminEmptyState kind="no_practices" className="mt-4" />
      ) : (
        <>
          <ul className="mt-4 list-none space-y-3 p-0">{visible.map((item) => <QueueRow key={item.id} item={item} />)}</ul>
          {hasMore ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Показаны первые {pageSize} из {filtered.length}.
            </p>
          ) : null}
        </>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="min-h-11">
          <Link href={allHref}>Показать все</Link>
        </Button>
      </div>
    </div>
  );
}
