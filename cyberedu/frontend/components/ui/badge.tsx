import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-border bg-muted/80 text-foreground",
  primary: "border-primary/25 bg-primary/10 text-primary",
  secondary: "border-secondary/25 bg-secondary/10 text-secondary",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/35 bg-warning/12 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
  outline: "border-border bg-card text-card-foreground",
  cyan: "border-cyan/30 bg-cyan/10 text-cyan",
} as const;

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium transition-colors duration-150",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
