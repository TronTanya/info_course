import * as React from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-muted/90 ring-1 ring-border/60", className)}
      aria-hidden
      {...props}
    />
  );
}
