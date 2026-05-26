import * as React from "react";
import { badgeBase } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-white/10 bg-white/5 text-foreground backdrop-blur-md",
  primary:
    "ce-cyber-badge--glow border-primary/35 bg-primary/15 text-primary",
  secondary: "border-white/10 bg-white/4 text-secondary-foreground backdrop-blur-md",
  accent: "border-accent/35 bg-accent/15 text-accent-foreground backdrop-blur-md",
  success: "border-success/35 bg-success/12 text-success backdrop-blur-md",
  warning: "border-warning/40 bg-warning/12 text-warning backdrop-blur-md",
  danger: "border-danger/35 bg-danger/12 text-danger backdrop-blur-md",
  outline: "border-white/10 bg-white/3 text-foreground backdrop-blur-md",
  cyan: "border-cyan/35 bg-cyan/12 text-cyan backdrop-blur-md",
} as const;

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn(badgeBase, variants[variant], className)} {...props} />;
}
