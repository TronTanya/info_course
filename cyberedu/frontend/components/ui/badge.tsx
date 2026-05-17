import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-border bg-muted/80 text-foreground",
  primary: "border-primary/30 bg-primary/12 text-primary",
  secondary: "border-secondary/30 bg-secondary/12 text-secondary-foreground",
  accent: "border-accent/35 bg-accent/12 text-accent",
  success: "border-success/35 bg-success/12 text-success",
  warning: "border-warning/40 bg-warning/12 text-warning",
  danger: "border-danger/35 bg-danger/12 text-danger",
  outline: "border-border bg-card text-card-foreground",
  cyan: "border-cyan/35 bg-cyan/12 text-cyan",
} as const;

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl border px-2.5 py-0.5 text-xs font-medium transition-colors duration-150",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
