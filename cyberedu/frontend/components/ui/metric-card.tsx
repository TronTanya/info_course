import * as React from "react";
import { widgetVariants } from "@/lib/design-system/components";
import { typography } from "@/lib/design-system/tokens";
import { cn } from "@/lib/utils";

const variants = {
  default: widgetVariants.base,
  accent: widgetVariants.accent,
  cyan: widgetVariants.accent,
  hero: widgetVariants.hero,
} as const;

export type MetricCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
};

/** Dashboard metric widget */
export function MetricCard({ label, value, hint, icon, variant = "default", className }: MetricCardProps) {
  return (
    <div className={cn(variants[variant], "min-w-0 p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className={widgetVariants.label}>{label}</p>
          <p className={cn(widgetVariants.value, "mt-1 wrap-break-word")}>{value}</p>
          {hint ? <p className={cn(typography.caption, "mt-1 wrap-break-word")}>{hint}</p> : null}
        </div>
        {icon ? (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/12 text-primary">
            {icon}
          </span>
        ) : null}
      </div>
    </div>
  );
}
