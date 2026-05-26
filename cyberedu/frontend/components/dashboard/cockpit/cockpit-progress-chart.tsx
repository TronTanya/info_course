"use client";

import { useMemo } from "react";
import type { CourseProgressModuleRow } from "@/lib/progress";
import { CockpitWidget, CockpitWidgetHeader } from "@/components/dashboard/cockpit/cockpit-widget";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function CockpitChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { name: string; progress: number } }[];
}) {
  if (!active || !payload?.[0]) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-sm">
      <p className="font-medium text-foreground">{p.name}</p>
      <p className="font-mono text-primary tabular-nums">{p.progress}%</p>
    </div>
  );
}

export function CockpitProgressChart({
  modules,
  delay = 0,
}: {
  modules: CourseProgressModuleRow[];
  delay?: number;
}) {
  const data = useMemo(
    () =>
      modules.slice(0, 8).map((row) => ({
        name: `M${row.module.orderNumber}`,
        progress: row.progressPercent,
        full: row.module.title,
      })),
    [modules],
  );

  const hasData = data.length > 0;

  return (
    <CockpitWidget variant="default" delay={delay} aria-labelledby="cockpit-chart-heading">
      <CockpitWidgetHeader eyebrow="Аналитика" title="Прогресс по модулям" />
      <div className="ce-cockpit-holo-ring h-55 w-full min-w-0 px-1 pb-2">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="cockpitArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--ce-primary)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--ce-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<CockpitChartTooltip />} />
              <Area
                type="monotone"
                dataKey="progress"
                stroke="var(--ce-primary)"
                strokeWidth={2}
                fill="url(#cockpitArea)"
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Нет данных модулей</p>
        )}
      </div>
    </CockpitWidget>
  );
}
