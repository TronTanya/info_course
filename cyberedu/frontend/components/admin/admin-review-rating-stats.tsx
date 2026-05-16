"use client";

import type { ReviewRatingStat } from "@/lib/admin-review-rating-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TooltipContentProps } from "recharts";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const SLICE_COLORS = ["#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#047857"] as const;

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
  if (total === 0) {
    return null;
  }

  const pieData: Datum[] = stats
    .filter((s) => s.count > 0)
    .map((s) => ({ ...s, label: `${s.stars}★` }));
  const hasAny = pieData.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Распределение оценок</CardTitle>
        <CardDescription>
          Доля отзывов по числу звёзд (всего {total}). Диаграмма и таблица считаются по всем записям в
          списке ниже, включая скрытые с публикации.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="mx-auto aspect-square w-full max-w-[280px] md:max-w-[320px]">
            {hasAny ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={ReviewPieTooltip} />
                  <Pie
                    data={pieData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius="52%"
                    outerRadius="88%"
                    paddingAngle={2}
                    stroke="var(--card)"
                    strokeWidth={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.stars} fill={SLICE_COLORS[entry.stars - 1]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Нет данных для диаграммы.
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5">Оценка</th>
                  <th className="px-4 py-2.5 text-right">Отзывов</th>
                  <th className="px-4 py-2.5 text-right">Доля</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row, i) => (
                  <tr key={row.stars} className="border-b border-border/80 last:border-0">
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: SLICE_COLORS[i] }}
                          aria-hidden
                        />
                        <span className="tabular-nums font-medium text-foreground">{row.stars} из 5</span>
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
      </CardContent>
    </Card>
  );
}
