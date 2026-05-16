import * as React from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Shimmer gradient instead of flat pulse */
  shimmer?: boolean;
};

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl ring-1 ring-border/50",
        shimmer ? "ce-skeleton-shimmer" : "animate-pulse bg-muted/90",
        className,
      )}
      aria-hidden
      {...props}
    />
  );
}
