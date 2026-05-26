"use client";

import type { AdminDashboardChartsData } from "@/lib/admin-dashboard-charts";
import { SectionCard } from "@/components/ui/section-card";
import { UiStatePanel } from "@/components/ui/ui-state-panel";
import type { TooltipContentProps } from "recharts";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type BarDatum = { label: string; count: number; fill: string };

function AdminBarTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as BarDatum | undefined;
  if (!p) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{p.label}</p>
      <p className="tabular-nums text-muted-foreground">{p.count}</p>
    </div>
  );
}

function ChartCard({
  title,
  description,
  data,
  emptyTitle,
}: {
  title: string;
  description: string;
  data: BarDatum[];
  emptyTitle: string;
}) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <SectionCard variant="lab" title={title} description={description} className="overflow-hidden ring-1 ring-secondary/10">
        <UiStatePanel
          state={hasData ? "idle" : "empty"}
          className="py-8"
          title={emptyTitle}
          description="Данные появятся после активности студентов."
        >
          <div className="h-55 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={52} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                <Tooltip content={AdminBarTooltip} cursor={{ fill: "color-mix(in oklab, var(--primary) 8%, transparent)" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {data.map((entry) => (
                    <Cell key={entry.label} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </UiStatePanel>
    </SectionCard>
  );
}

export function AdminDashboardCharts({ data }: { data: AdminDashboardChartsData }) {
  const submissions: BarDatum[] = data.submissions.map((s) => ({
    label: s.label,
    count: s.count,
    fill: s.fill,
  }));

  const progress: BarDatum[] = data.progressBuckets.map((s) => ({
    label: s.label,
    count: s.count,
    fill: s.fill,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard
        title="Практика по статусам"
        description="Отправки, кроме черновиков."
        data={submissions}
        emptyTitle="Нет отправок"
      />
      <ChartCard
        title="Прогресс студентов"
        description="Доля завершённых активных модулей курса."
        data={progress}
        emptyTitle="Нет студентов"
      />
    </div>
  );
}
