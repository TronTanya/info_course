import * as React from "react";
import { badgeBase } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-border bg-muted/80 text-foreground",
  primary: "border-primary/30 bg-primary/12 text-primary",
  secondary: "border-border bg-secondary/80 text-secondary-foreground",
  accent: "border-accent/35 bg-accent/20 text-accent-foreground",
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
  return <span className={cn(badgeBase, variants[variant], className)} {...props} />;
}
