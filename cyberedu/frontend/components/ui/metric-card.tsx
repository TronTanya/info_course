import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "ce-metric-card",
  accent: "ce-metric-card ce-metric-card--accent",
  cyan: "ce-metric-card ce-metric-card--cyan",
} as const;

export type MetricCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
};

/** Компактная метрика (дашборд, модуль, админка). */
export function MetricCard({ label, value, hint, icon, variant = "default", className }: MetricCardProps) {
  return (
    <div className={cn(variants[variant], "min-w-0 px-3 py-3 sm:px-4", className)}>
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="typo-label break-words">{label}</p>
          <p className="mt-1 break-words text-lg font-semibold tabular-nums tracking-tight text-foreground sm:text-xl">
            {value}
          </p>
          {hint ? <p className="typo-caption mt-0.5 break-words">{hint}</p> : null}
        </div>
        {icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary sm:size-10">
            {icon}
          </span>
        ) : null}
      </div>
    </div>
  );
}
