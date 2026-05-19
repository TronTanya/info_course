import * as React from "react";
import { cyber } from "@/lib/design-system/cyber";
import { cn } from "@/lib/utils";

export type MetricCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
};

/** Компактная метрика (дашборд, модуль, админка). */
export function MetricCard({ label, value, hint, className }: MetricCardProps) {
  return (
    <div
      className={cn(cyber.metric, className)}
    >
      <p className="typo-label">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
      {hint ? <p className="typo-caption mt-0.5">{hint}</p> : null}
    </div>
  );
}
