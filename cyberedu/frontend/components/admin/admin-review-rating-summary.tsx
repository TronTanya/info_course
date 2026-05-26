import type { ReviewRatingStat } from "@/lib/admin-review-rating-stats";

const SLICE_COLORS = ["#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#047857"] as const;

export function AdminReviewRatingSummary({
  stats,
  total,
}: {
  stats: ReadonlyArray<ReviewRatingStat>;
  total: number;
}) {
  if (total === 0) return null;

  return (
    <section className="ce-admin-panel rounded-2xl border border-border bg-card shadow-sm">
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-foreground">Распределение оценок</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Всего {total} отзывов (включая скрытые с публикации).
        </p>
      </header>
      <div className="overflow-x-auto p-4 sm:p-6">
        <table className="w-full min-w-112 text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 pr-4">Оценка</th>
              <th className="pb-2 pr-4 text-right">Отзывов</th>
              <th className="pb-2 text-right">Доля</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((row, i) => (
              <tr key={row.stars} className="border-b border-border/80 last:border-0">
                <td className="py-2.5 pr-4 text-foreground">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: SLICE_COLORS[i] }}
                      aria-hidden
                    />
                    {row.stars} из 5
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">{row.count}</td>
                <td className="py-2.5 text-right tabular-nums font-medium text-foreground">{row.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
