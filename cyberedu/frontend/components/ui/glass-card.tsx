import * as React from "react";
import { cn } from "@/lib/utils";

export type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Тонкое свечение границы */
  glow?: boolean;
};

export function GlassCard({ className, glow = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "ce-glass rounded-2xl text-card-foreground transition-[box-shadow,border-color] duration-200",
        glow && "border-glow",
        className,
      )}
      {...props}
    />
  );
}
