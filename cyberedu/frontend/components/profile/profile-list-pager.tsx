"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 8;

export type ProfileListPagerProps<T> = {
  items: T[];
  pageSize?: number;
  className?: string;
  renderItem: (item: T) => React.ReactNode;
};

export function ProfileListPager<T>({
  items,
  pageSize = DEFAULT_PAGE_SIZE,
  className,
  renderItem,
}: ProfileListPagerProps<T>) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    queueMicrotask(() => setPage((p) => Math.min(p, pageCount - 1)));
  }, [items.length, pageCount]);

  const slice = useMemo(() => {
    const start = page * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const rangeStart = items.length === 0 ? 0 : page * pageSize + 1;
  const rangeEnd = Math.min((page + 1) * pageSize, items.length);
  const showPager = items.length > pageSize;

  return (
    <div className={cn("space-y-3", className)}>
      <ul className="space-y-2">{slice.map((item) => renderItem(item))}</ul>
      {showPager ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
          <p className="text-xs text-muted-foreground tabular-nums">
            Показано {rangeStart}–{rangeEnd} из {items.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              aria-label="Предыдущая страница"
            >
              <ChevronLeft className="size-4" aria-hidden />
              Назад
            </Button>
            <span className="min-w-16 px-1 text-center text-xs font-medium tabular-nums text-muted-foreground">
              {page + 1} / {pageCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              aria-label="Следующая страница"
            >
              Далее
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
