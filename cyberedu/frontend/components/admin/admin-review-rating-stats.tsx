"use client";

import * as React from "react";
import type { ReviewRatingStat } from "@/lib/admin-review-rating-stats";
import { AdminTableCard } from "@/components/admin/admin-table-card";
import type { TooltipContentProps } from "recharts";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

const SLICE_COLORS = ["#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#047857"] as const;
const CHART_W = 300;
const CHART_H = 260;

type Datum = ReviewRatingStat & { label: string };

function ReviewPieTooltip(props: TooltipContentProps) {
  const { active, payload } = props;
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as Datum | undefined;
  if (!p) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{p.label}</p>
      <p className="text-muted-foreground">
        {p.count} отзывов ({p.percent}%)
      </p>
    </div>
  );
}

export function AdminReviewRatingStatsPanel({
  stats,
  total,
}: {
  stats: ReadonlyArray<ReviewRatingStat>;
  total: number;
}) {
  const [chartReady, setChartReady] = React.useState(false);

  React.useEffect(() => {
    setChartReady(true);
  }, []);

  if (total === 0) {
    return null;
  }

  const pieData: Datum[] = stats
    .filter((s) => s.count > 0)
    .map((s) => ({ ...s, label: `${s.stars}★` }));
  const hasAny = pieData.length > 0;

  return (
    <AdminTableCard
      className="ce-admin-rating-stats"
      title="Распределение оценок"
      description={`Доля отзывов по числу звёзд (всего ${total}). Считается по всем записям в списке ниже, включая скрытые с публикации.`}
    >
      <div className="grid min-w-0 gap-8 p-4 sm:p-6 md:grid-cols-2 md:items-start">
        <div className="ce-admin-rating-chart mx-auto flex w-full max-w-80 shrink-0 items-center justify-center md:mx-0">
          {hasAny && chartReady ? (
            <PieChart width={CHART_W} height={CHART_H} className="max-w-full">
              <Tooltip content={ReviewPieTooltip} />
              <Pie
                data={pieData}
                dataKey="count"
                nameKey="label"
                cx={CHART_W / 2}
                cy={CHART_H / 2}
                innerRadius={CHART_H * 0.22}
                outerRadius={CHART_H * 0.38}
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={2}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.stars} fill={SLICE_COLORS[entry.stars - 1]} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <div
              className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground"
              style={{ width: CHART_W, height: CHART_H, maxWidth: "100%" }}
            >
              {hasAny ? "Загрузка диаграммы…" : "Нет данных для диаграммы."}
            </div>
          )}
        </div>

        <div className="ce-admin-rating-side-table min-w-0 rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5">Оценка</th>
                <th className="px-4 py-2.5 text-right">Отзывов</th>
                <th className="px-4 py-2.5 text-right">Доля</th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {stats.map((row, i) => (
                <tr key={row.stars} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 text-foreground">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: SLICE_COLORS[i] }}
                        aria-hidden
                      />
                      <span className="tabular-nums font-medium">{row.stars} из 5</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{row.count}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium text-foreground">
                    {row.percent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminTableCard>
  );
}
