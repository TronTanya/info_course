import * as React from "react";
import { transitionBase } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

const variants = {
  default: "ce-premium-card",
  glow: "ce-premium-card ce-premium-card--glow",
  accent: "ce-premium-card ce-premium-card--accent",
  flat: "ce-glass rounded-2xl",
  muted: "rounded-2xl border border-border/80 bg-muted/20 shadow-sm",
} as const;

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
} as const;

export type PremiumCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** @deprecated Используйте variant="glow" */
  glow?: boolean;
  variant?: keyof typeof variants;
  padding?: keyof typeof paddings;
  interactive?: boolean;
};

export function PremiumCard({
  className,
  glow,
  variant,
  padding = "none",
  interactive = false,
  ...props
}: PremiumCardProps) {
  const resolvedVariant = variant ?? (glow ? "glow" : "default");

  return (
    <div
      className={cn(
        variants[resolvedVariant],
        paddings[padding],
        "min-w-0 max-w-full",
        interactive && "ce-premium-card--interactive cursor-default",
        transitionBase,
        className,
      )}
      {...props}
    />
  );
}
