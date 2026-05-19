import * as React from "react";
import { transitionBase } from "@/lib/design-system/primitives";
import { cn } from "@/lib/utils";

export type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  glow?: boolean;
};

export function GlassCard({ className, glow = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "ce-glass rounded-2xl text-card-foreground",
        transitionBase,
        glow && "border-glow hover:shadow-[var(--shadow-glow)]",
        className,
      )}
      {...props}
    />
  );
}
