import * as React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CyberBadgeProps = BadgeProps & {
  /** Индикатор «live» / активности */
  dot?: boolean;
  /** Мягкое violet-свечение */
  glow?: boolean;
};

export function CyberBadge({ className, dot, glow, children, ...props }: CyberBadgeProps) {
  return (
    <Badge
      className={cn(
        "ce-cyber-badge gap-1.5",
        glow && "ce-cyber-badge--glow",
        className,
      )}
      {...props}
    >
      {dot ? (
        <span className="relative flex size-2 shrink-0" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-cyan/50 opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-cyan" />
        </span>
      ) : null}
      {children}
    </Badge>
  );
}
