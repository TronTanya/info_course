import * as React from "react";
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
      className={cn(
        "rounded-2xl border border-border/70 bg-linear-to-br from-card to-muted/15 px-4 py-3 shadow-sm ring-1 ring-inset ring-white/40 transition-shadow hover:shadow-card",
        className,
      )}
    >
      <p className="typo-label">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
      {hint ? <p className="typo-caption mt-0.5">{hint}</p> : null}
    </div>
  );
}
