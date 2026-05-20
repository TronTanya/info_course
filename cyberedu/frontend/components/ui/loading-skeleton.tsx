import * as React from "react";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type LoadingSkeletonProps = {
  className?: string;
  /** Количество строк-полос */
  lines?: number;
  showHeader?: boolean;
  /** Обёртка в premium glass card */
  variant?: "plain" | "card";
};

export function LoadingSkeleton({
  className,
  lines = 4,
  showHeader = true,
  variant = "plain",
}: LoadingSkeletonProps) {
  const body = (
    <div className={cn("space-y-4", className)} aria-busy="true" aria-label="Загрузка">
      {showHeader ? (
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-2/3 max-w-sm" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
      ) : null}
      <div className="space-y-3">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className={cn("h-12 w-full", i === lines - 1 && "w-4/5")} />
        ))}
      </div>
    </div>
  );

  if (variant === "card") {
    return (
      <PremiumCard padding="md" variant="flat" className={className}>
        {body}
      </PremiumCard>
    );
  }

  return body;
}
