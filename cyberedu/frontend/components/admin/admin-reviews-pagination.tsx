import Link from "next/link";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

export function getReviewsPageSize() {
  return PAGE_SIZE;
}

export function AdminReviewsPagination({
  page,
  total,
  basePath = "/admin/reviews",
}: {
  page: number;
  total: number;
  basePath?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (current - 1) * PAGE_SIZE + 1;
  const to = Math.min(current * PAGE_SIZE, total);

  if (totalPages <= 1) {
    return (
      <p className="px-4 py-3 text-sm text-muted-foreground sm:px-6">
        {total === 0 ? "0 записей" : `Показаны все ${total} записей`}
      </p>
    );
  }

  const prev = current > 1 ? `${basePath}?page=${current - 1}` : null;
  const next = current < totalPages ? `${basePath}?page=${current + 1}` : null;

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-muted-foreground">
        {from}–{to} из {total}
      </p>
      <div className="flex items-center gap-2">
        {prev ? (
          <Link
            href={prev}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted"
          >
            ← Назад
          </Link>
        ) : (
          <span className="inline-flex h-9 cursor-not-allowed items-center rounded-lg border border-border/50 px-3 text-sm text-muted-foreground">
            ← Назад
          </span>
        )}
        <span className="px-2 text-sm tabular-nums text-muted-foreground">
          {current} / {totalPages}
        </span>
        {next ? (
          <Link
            href={next}
            className={cn(
              "inline-flex h-9 items-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted",
            )}
          >
            Вперёд →
          </Link>
        ) : (
          <span className="inline-flex h-9 cursor-not-allowed items-center rounded-lg border border-border/50 px-3 text-sm text-muted-foreground">
            Вперёд →
          </span>
        )}
      </div>
    </div>
  );
}
