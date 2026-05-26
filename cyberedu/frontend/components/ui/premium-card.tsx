import * as React from "react";
import { cardVariants } from "@/lib/design-system/components";
import { transitionBase } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
} as const;

export type PremiumCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** @deprecated Используйте variant="glow" */
  glow?: boolean;
  variant?: "default" | "glow" | "accent" | "flat" | "muted";
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
  const resolved = variant ?? (glow ? "glow" : "default");

  return (
    <div
      className={cn(
        cardVariants.base,
        "ce-premium-card min-w-0 max-w-full",
        transitionBase,
        resolved === "glow" && cn(cardVariants.glow, "ce-premium-card--glow"),
        resolved === "accent" && "ce-premium-card--accent border-primary/25",
        resolved === "flat" && "ds-glass-surface rounded-2xl",
        resolved === "muted" && "rounded-2xl border border-white/6 bg-white/2",
        resolved === "default" && "ce-premium-card",
        interactive && cn(cardVariants.interactive, "ce-premium-card--interactive cursor-default"),
        paddings[padding],
        className,
      )}
      {...props}
    />
  );
}
